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
  SRGBColorSpace,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector3,
} from "three";
import type { EngineClient, ViewContext } from "./engine/types";
import { GLOBE_LABELS, HUBS, SURAT, type Hub } from "@/lib/routes";

const INK = new Color("#121212");
const ACCENT = new Color("#a2845a");
const GLOW = new Color("#fff1d6");
const WHITE = new Color("#ffffff");
const ATMOSPHERE = new Color("#8fb8ff");

const TEXTURES = {
  day: "/textures/planets/earth_atmos_2048.jpg",
  specular: "/textures/planets/earth_specular_2048.jpg",
  clouds: "/textures/planets/earth_clouds_1024.png",
};

/** Works on the main thread and inside the render worker (no DOM image loader) */
async function loadTexture(url: string, srgb: boolean) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const bitmap = await createImageBitmap(await res.blob());
  const texture = new Texture(bitmap);
  texture.flipY = false; // ignored for ImageBitmap; the shaders flip v instead
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** lon 0 faces the camera (+z); east is to the right */
function toVec(lat: number, lon: number, r = 1) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  return new Vector3(Math.cos(phi) * Math.sin(lambda) * r, Math.sin(phi) * r, Math.cos(phi) * Math.cos(lambda) * r);
}

const damp = (c: number, t: number, l: number, dt: number) => c + (t - c) * (1 - Math.exp(-l * dt));

/**
 * Route globe with real Earth imagery. Drawn in four calls: textured Earth,
 * cloud layer, all arcs (one line batch with travelling pulses), and city markers.
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
  private textures: Texture[] = [];
  private clouds: Mesh | null = null;
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

    this.buildArcs();
    this.buildMarkers();
    this.labelPoints = GLOBE_LABELS.map((h) => ({
      name: h.name,
      pos: toVec(h.lat, h.lon, 1.02),
    }));
  }

  attach(ctx: ViewContext) {
    this.ctx = ctx;
    this.loadEarth();
  }

  call() {
    /* no commands */
  }

  dispose() {
    this.disposed = true;
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
  }

  /* ----------------------------- building ----------------------------- */

  private track(m: ShaderMaterial) {
    this.materials.push(m);
    return m;
  }

  private async loadEarth() {
    try {
      const [day, specular] = await Promise.all([loadTexture(TEXTURES.day, true), loadTexture(TEXTURES.specular, false)]);
      const clouds = await loadTexture(TEXTURES.clouds, true).catch(() => null);
      this.textures.push(day, specular, ...(clouds ? [clouds] : []));
      if (this.disposed) return this.textures.forEach((t) => t.dispose());

      // Shared view-space light from the upper left so the visible face is always lit
      const light = { value: new Vector3(-0.45, 0.55, 0.7).normalize() };
      const vertexShader = /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main() {
          vUv = uv;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`;

      // Earth: day imagery, sun-lit oceans and a thin blue atmosphere at the rim.
      // It also hides the far side of every arc and marker.
      const body = new Mesh(
        new SphereGeometry(0.985, 96, 64),
        this.track(
          new ShaderMaterial({
            uniforms: { uDay: { value: day }, uSpec: { value: specular }, uLight: light, uAtmos: { value: ATMOSPHERE } },
            vertexShader,
            fragmentShader: /* glsl */ `
              uniform sampler2D uDay; uniform sampler2D uSpec; uniform vec3 uLight; uniform vec3 uAtmos;
              varying vec2 vUv; varying vec3 vN; varying vec3 vV;
              void main() {
                vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
                vec3 n = normalize(vN);
                vec3 v = normalize(vV);
                float ndl = dot(n, uLight);
                vec3 col = texture2D(uDay, uv).rgb * (0.45 + 0.7 * smoothstep(-0.35, 0.9, ndl));
                float spec = texture2D(uSpec, uv).r * pow(max(dot(n, normalize(uLight + v)), 0.0), 36.0);
                col += spec * 0.3;
                float rim = pow(1.0 - max(dot(n, v), 0.0), 2.4);
                col = mix(col, uAtmos, rim * 0.7);
                gl_FragColor = vec4(col, 1.0);
                #include <colorspace_fragment>
              }`,
          })
        )
      );
      // Sphere UVs start at lon −90; turn the mesh so the map's prime meridian sits at lon 0
      body.rotation.y = -Math.PI / 2;
      body.renderOrder = 0;
      this.earth.add(body);

      if (clouds) {
        this.clouds = new Mesh(
          new SphereGeometry(0.992, 64, 48),
          this.track(
            new ShaderMaterial({
              transparent: true,
              depthWrite: false,
              uniforms: { uClouds: { value: clouds }, uLight: light },
              vertexShader,
              fragmentShader: /* glsl */ `
                uniform sampler2D uClouds; uniform vec3 uLight;
                varying vec2 vUv; varying vec3 vN; varying vec3 vV;
                void main() {
                  vec4 c = texture2D(uClouds, vec2(vUv.x, 1.0 - vUv.y));
                  float lit = 0.55 + 0.45 * smoothstep(-0.35, 0.9, dot(normalize(vN), uLight));
                  float a = c.r * c.a * 0.5;
                  if (a < 0.01) discard;
                  gl_FragColor = vec4(vec3(lit), a);
                  #include <colorspace_fragment>
                }`,
            })
          )
        );
        this.clouds.rotation.y = -Math.PI / 2;
        this.clouds.renderOrder = 1;
        this.earth.add(this.clouds);
      }

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
        uniforms: { uColor: { value: ACCENT }, uAccent: { value: GLOW }, uTime: { value: 0 }, uReveal: { value: 0 } },
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
            gl_FragColor = vec4(col, 0.6 + pulse * 0.4);
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
        uniforms: { uColor: { value: INK }, uAccent: { value: ACCENT }, uWhite: { value: WHITE }, uTime: { value: 0 }, uScale: { value: 1 }, uReveal: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aKind; uniform float uScale;
          varying float vKind; varying float vFacing;
          void main() {
            vKind = aKind;
            vFacing = normalize(normalMatrix * position).z;
            gl_PointSize = (aKind > 0.5 ? 46.0 : 11.0) * uScale;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform vec3 uAccent; uniform vec3 uWhite; uniform float uTime; uniform float uReveal;
          varying float vKind; varying float vFacing;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float vis = smoothstep(0.0, 0.3, vFacing) * uReveal;
            if (vKind > 0.5) {
              // white dot with a dark edge, plus a pulsing gold ring
              float core = smoothstep(0.1, 0.075, d);
              float r = fract(uTime * 0.55) * 0.42 + 0.08;
              float ring = smoothstep(0.022, 0.0, abs(d - r)) * (1.0 - fract(uTime * 0.55));
              float a = max(core, ring * 0.9) * vis;
              if (a < 0.01) discard;
              vec3 dot = mix(uWhite, uColor, smoothstep(0.05, 0.075, d));
              gl_FragColor = vec4(mix(uAccent, dot, core), a);
            } else {
              // white dot with a dark edge, readable on land and sea
              float a = smoothstep(0.5, 0.4, d) * vis;
              if (a < 0.01) discard;
              gl_FragColor = vec4(mix(uWhite, uColor, smoothstep(0.24, 0.34, d)), a);
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
    if (this.clouds) this.clouds.rotation.y = -Math.PI / 2 + time * 0.006; // slow cloud drift
    if (this.reveal < 1) this.reveal = Math.min(1, this.reveal + dt / 2.6);
    return true; // pulses travel continuously while the globe is on screen (cheap)
  }

  prepare() {
    const eased = 1 - Math.pow(1 - this.reveal, 3);
    this.arcMaterial.uniforms.uTime.value = this.time;
    this.arcMaterial.uniforms.uReveal.value = eased;
    this.markerMaterial.uniforms.uTime.value = this.time;
    this.markerMaterial.uniforms.uReveal.value = eased;
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
