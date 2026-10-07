import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineSegments,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import type { EngineClient, ViewContext } from "./engine/types";
import { GLOBE_LABELS, HUBS, SURAT, type Hub } from "@/lib/routes";

const INK = new Color("#121212");
const ACCENT = new Color("#a2845a");
const BODY = new Color("#f1eee8");
const RIM = new Color("#d9d3c8");

/** lon 0 faces the camera (+z); east is to the right */
function toVec(lat: number, lon: number, r = 1) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  return new Vector3(Math.cos(phi) * Math.sin(lambda) * r, Math.sin(phi) * r, Math.cos(phi) * Math.cos(lambda) * r);
}

const damp = (c: number, t: number, l: number, dt: number) => c + (t - c) * (1 - Math.exp(-l * dt));

/**
 * Dotted route globe. Everything is drawn in four calls: body, land dots, all
 * arcs (one line batch with travelling pulses), and city markers.
 */
export class GlobeStage implements EngineClient {
  scene = new Scene();
  camera = new PerspectiveCamera(30, 1, 0.1, 50);

  private ctx: ViewContext | null = null;
  private cssW = 1;
  private cssH = 1;
  private dpr = 1;
  private earth = new Group();
  private materials: ShaderMaterial[] = [];
  private arcMaterial!: ShaderMaterial;
  private markerMaterial!: ShaderMaterial;
  private dotMaterial!: ShaderMaterial;
  private ready = false;
  private disposed = false;
  private reveal = 0;
  private time = 0;

  private yaw: number;
  private pitch = 0.32;
  private velocity = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private pitchTarget = 0.32;

  private labelPoints: { name: string; pos: Vector3 }[];
  private tmp = new Vector3();
  private normal = new Vector3();
  private toCam = new Vector3();

  constructor() {
    // Centre on the Arabian Sea so Surat, Europe and Asia-Pacific are in view
    this.yaw = -((SURAT.lon - 28) * Math.PI) / 180;

    this.scene.add(this.earth);
    this.camera.position.set(0, 0, 4.6);
    this.camera.lookAt(0, 0, 0);

    this.buildBody();
    this.buildArcs();
    this.buildMarkers();
    this.labelPoints = GLOBE_LABELS.map((h) => ({
      name: h.name,
      pos: toVec(h.lat, h.lon, 1.02),
    }));
  }

  attach(ctx: ViewContext) {
    this.ctx = ctx;
    this.loadDots();
  }

  call() {
    /* no commands */
  }

  dispose() {
    this.disposed = true;
    this.materials.forEach((m) => m.dispose());
  }

  /* ----------------------------- building ----------------------------- */

  private track(m: ShaderMaterial) {
    this.materials.push(m);
    return m;
  }

  private buildBody() {
    // Porcelain sphere with a soft rim; it also hides the far side of every arc and dot
    const material = this.track(
      new ShaderMaterial({
        uniforms: { uBody: { value: BODY }, uRim: { value: RIM } },
        vertexShader: /* glsl */ `
          varying float vFacing;
          void main() {
            vec3 n = normalize(normalMatrix * normal);
            vFacing = n.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uBody; uniform vec3 uRim;
          varying float vFacing;
          void main() {
            vec3 c = mix(uRim, uBody, smoothstep(0.0, 0.55, vFacing));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      })
    );
    const body = new Mesh(new SphereGeometry(0.985, 48, 32), material);
    body.renderOrder = 0;
    this.earth.add(body);
  }

  private async loadDots() {
    try {
      const res = await fetch("/models/globe-dots.bin");
      if (!res.ok) throw new Error(`globe dots ${res.status}`);
      const raw = new Int16Array(await res.arrayBuffer());
      if (this.disposed) return;
      const count = raw.length / 2;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const v = toVec(raw[i * 2] / 100, raw[i * 2 + 1] / 100, 1);
        positions.set([v.x, v.y, v.z], i * 3);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      this.dotMaterial = this.track(
        new ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uColor: { value: INK }, uSize: { value: 2.2 }, uReveal: { value: 0 } },
          vertexShader: /* glsl */ `
            uniform float uSize;
            varying float vFacing;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vFacing = normalize(normalMatrix * position).z;
              gl_PointSize = uSize * (0.55 + 0.45 * max(vFacing, 0.0));
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            uniform vec3 uColor; uniform float uReveal;
            varying float vFacing;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              if (d > 0.5) discard;
              float a = smoothstep(0.5, 0.2, d) * smoothstep(0.0, 0.45, vFacing) * 0.5 * uReveal;
              gl_FragColor = vec4(uColor, a);
              #include <colorspace_fragment>
            }`,
        })
      );
      const dots = new Points(geometry, this.dotMaterial);
      dots.renderOrder = 1;
      this.earth.add(dots);
      this.applyPixelRatio();
      await this.ctx?.compile().catch(() => undefined);
      if (this.disposed) return;
      this.ready = true;
      this.ctx?.emit("ready");
      this.ctx?.invalidate();
    } catch (e) {
      this.ctx?.emit("error", String(e));
    }
  }

  private buildArcs() {
    const SEG = 64;
    const a = toVec(SURAT.lat, SURAT.lon);
    const positions: number[] = [];
    const progress: number[] = [];
    const offsets: number[] = [];
    HUBS.forEach((hub: Hub, idx) => {
      const b = toVec(hub.lat, hub.lon);
      const angle = a.angleTo(b);
      const lift = 0.04 + 0.22 * (angle / Math.PI);
      const pts: Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG;
        // spherical interpolation, lifted off the surface
        const s = Math.sin(angle) || 1;
        const p = a
          .clone()
          .multiplyScalar(Math.sin((1 - t) * angle) / s)
          .add(b.clone().multiplyScalar(Math.sin(t * angle) / s))
          .normalize()
          .multiplyScalar(1.004 + lift * Math.sin(Math.PI * t));
        pts.push(p);
      }
      for (let i = 0; i < SEG; i++) {
        positions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
        progress.push(i / SEG, (i + 1) / SEG);
        offsets.push(idx * 0.137, idx * 0.137);
      }
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("aT", new BufferAttribute(new Float32Array(progress), 1));
    geometry.setAttribute("aOffset", new BufferAttribute(new Float32Array(offsets), 1));
    this.arcMaterial = this.track(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: INK }, uAccent: { value: ACCENT }, uTime: { value: 0 }, uReveal: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aT; attribute float aOffset;
          varying float vT; varying float vOffset;
          void main() {
            vT = aT; vOffset = aOffset;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform vec3 uAccent; uniform float uTime; uniform float uReveal;
          varying float vT; varying float vOffset;
          void main() {
            if (vT > uReveal) discard;
            float head = fract(uTime * 0.18 + vOffset);
            float d = head - vT;
            float pulse = d >= 0.0 ? exp(-d * 18.0) : 0.0;
            vec3 col = mix(uColor, uAccent, pulse);
            gl_FragColor = vec4(col, 0.32 + pulse * 0.68);
            #include <colorspace_fragment>
          }`,
      })
    );
    const arcs = new LineSegments(geometry, this.arcMaterial);
    arcs.renderOrder = 2;
    this.earth.add(arcs);
  }

  private buildMarkers() {
    const all = [SURAT, ...HUBS];
    const positions = new Float32Array(all.length * 3);
    const kind = new Float32Array(all.length);
    all.forEach((h, i) => {
      const v = toVec(h.lat, h.lon, 1.006);
      positions.set([v.x, v.y, v.z], i * 3);
      kind[i] = i === 0 ? 1 : 0;
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aKind", new BufferAttribute(kind, 1));
    this.markerMaterial = this.track(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
        uniforms: { uColor: { value: INK }, uAccent: { value: ACCENT }, uTime: { value: 0 }, uScale: { value: 1 }, uReveal: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aKind; uniform float uScale;
          varying float vKind; varying float vFacing;
          void main() {
            vKind = aKind;
            vFacing = normalize(normalMatrix * position).z;
            gl_PointSize = (aKind > 0.5 ? 46.0 : 9.0) * uScale;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform vec3 uAccent; uniform float uTime; uniform float uReveal;
          varying float vKind; varying float vFacing;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float vis = smoothstep(0.0, 0.3, vFacing) * uReveal;
            if (vKind > 0.5) {
              float core = smoothstep(0.1, 0.075, d);
              float r = fract(uTime * 0.55) * 0.42 + 0.08;
              float ring = smoothstep(0.022, 0.0, abs(d - r)) * (1.0 - fract(uTime * 0.55));
              float a = max(core, ring * 0.9) * vis;
              if (a < 0.01) discard;
              gl_FragColor = vec4(mix(uAccent, uColor, core), a);
            } else {
              float a = smoothstep(0.5, 0.3, d) * vis;
              float hole = smoothstep(0.2, 0.28, d);
              if (a < 0.01) discard;
              gl_FragColor = vec4(uColor, a * mix(1.0, 0.95, hole));
            }
            #include <colorspace_fragment>
          }`,
      })
    );
    const markers = new Points(geometry, this.markerMaterial);
    markers.renderOrder = 3;
    this.earth.add(markers);
  }

  /* --------------------------- RenderClient ---------------------------- */

  update(dt: number, time: number): boolean {
    if (!this.ready) return false;
    this.time = time;
    if (!this.dragging) {
      this.yaw += (this.ctx?.quality().autoRotate ? 0.04 : 0) * dt + this.velocity * dt;
      this.velocity = damp(this.velocity, 0, 2.2, dt);
      this.pitchTarget = damp(this.pitchTarget, 0.32, 0.8, dt);
    }
    this.pitch = damp(this.pitch, this.pitchTarget, 6, dt);
    this.earth.rotation.set(this.pitch, this.yaw, 0);
    if (this.reveal < 1) this.reveal = Math.min(1, this.reveal + dt / 2.6);
    return true; // pulses travel continuously while the globe is on screen (cheap)
  }

  prepare() {
    const eased = 1 - Math.pow(1 - this.reveal, 3);
    this.arcMaterial.uniforms.uTime.value = this.time;
    this.arcMaterial.uniforms.uReveal.value = eased;
    this.markerMaterial.uniforms.uTime.value = this.time;
    this.markerMaterial.uniforms.uReveal.value = eased;
    if (this.dotMaterial) this.dotMaterial.uniforms.uReveal.value = Math.min(1, this.reveal * 2);
    this.emitLabels(eased);
  }

  setViewport(w: number, h: number, dpr: number) {
    this.cssW = Math.max(1, w);
    this.cssH = Math.max(1, h);
    this.dpr = dpr;
    this.applyPixelRatio();
    this.camera.aspect = this.cssW / this.cssH;
    // Keep the whole globe (with arc lift) in frame on narrow screens
    const fov = (this.camera.fov * Math.PI) / 180;
    const fitH = 1.18 / Math.tan(fov / 2);
    this.camera.position.z = Math.max(fitH, fitH / Math.min(this.camera.aspect, 1)) * 1.02;
    this.camera.updateProjectionMatrix();
    this.ctx?.invalidate();
  }

  pointer(type: "down" | "move" | "up", x: number, y: number) {
    if (type === "down") {
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
      this.velocity = 0;
    } else if (type === "move" && this.dragging) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      this.yaw += dx * 0.006;
      this.velocity = dx * 0.006 * 60;
      this.pitchTarget = Math.max(-0.4, Math.min(0.9, this.pitchTarget + dy * 0.004));
    } else if (type === "up") {
      this.dragging = false;
    }
    this.ctx?.invalidate();
  }

  /* ------------------------------ internals ----------------------------- */

  private applyPixelRatio() {
    if (this.dotMaterial) this.dotMaterial.uniforms.uSize.value = 2.3 * this.dpr;
    if (this.markerMaterial) this.markerMaterial.uniforms.uScale.value = this.dpr;
  }

  /** Screen positions of labelled cities, sent to the page as flat [x, y, facing] triples */
  private emitLabels(reveal: number) {
    this.earth.updateMatrixWorld();
    const out: number[] = [];
    for (const { pos } of this.labelPoints) {
      this.tmp.copy(pos).applyMatrix4(this.earth.matrixWorld);
      this.normal.copy(this.tmp).normalize();
      this.toCam.copy(this.camera.position).sub(this.tmp).normalize();
      const facing = Math.max(0, Math.min(1, (this.normal.dot(this.toCam) - 0.15) / 0.35)) * reveal;
      this.tmp.project(this.camera);
      out.push(Math.round((this.tmp.x * 0.5 + 0.5) * this.cssW), Math.round((-this.tmp.y * 0.5 + 0.5) * this.cssH), Math.round(facing * 100) / 100);
    }
    this.ctx?.emit("labels", out);
  }
}
