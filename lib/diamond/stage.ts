import { BufferAttribute, BufferGeometry, FrontSide, Group, Matrix4, Mesh, PerspectiveCamera, Scene, ShaderMaterial } from "three";
import { MeshBVH, MeshBVHUniformStruct } from "three-mesh-bvh";
import { diamondFragmentShader, diamondVertexShader } from "./shader";
import type { EngineClient, ViewContext } from "@/lib/three/engine/types";
import type { QualitySettings } from "@/lib/three/quality";

export interface DiamondOptions {
  model: string;
  /** Radians per second of turntable rotation (0 = still) */
  autoRotate?: number;
  /** Base forward tilt in radians – how much of the table faces the viewer */
  tilt?: number;
  /** Allow drag-to-rotate */
  interactive?: boolean;
  /** Fraction of the viewport the stone should fill (0–1) */
  fill?: number;
}

interface DiamondAsset {
  geometry: BufferGeometry;
  uniform: MeshBVHUniformStruct;
}

/* ---------------------------------------------------------------------------
   Asset cache: each stone is downloaded and BVH-indexed once per session.
   Works in a Web Worker (no DOM APIs).
--------------------------------------------------------------------------- */
const assetCache = new Map<string, Promise<DiamondAsset>>();

const gs = globalThis as typeof globalThis & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
};
const idle = () =>
  new Promise<void>((resolve) => {
    if (gs.requestIdleCallback) gs.requestIdleCallback(() => resolve(), { timeout: 600 });
    else setTimeout(resolve, 8);
  });

export function loadDiamondAsset(model: string): Promise<DiamondAsset> {
  let pending = assetCache.get(model);
  if (!pending) {
    pending = fetch(`/models/diamonds/${model}.bin`)
      .then((res) => {
        if (!res.ok) throw new Error(`Diamond model "${model}" failed to load (${res.status})`);
        return res.arrayBuffer();
      })
      .then(async (buffer) => {
        await idle();
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(new Float32Array(buffer), 3));
        geometry.computeVertexNormals(); // non-indexed → crisp flat facet normals
        const bvh = new MeshBVH(geometry, { targetLeafSize: 4 });
        const uniform = new MeshBVHUniformStruct();
        uniform.updateFrom(bvh);
        geometry.computeBoundingSphere();
        return { geometry, uniform };
      });
    pending.catch(() => assetCache.delete(model));
    assetCache.set(model, pending);
  }
  return pending;
}

/** Warm the cache one stone at a time. */
export async function prefetchDiamondAssets(models: string[]) {
  for (const m of models) {
    await idle();
    await loadDiamondAsset(m).catch(() => undefined);
  }
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class DiamondStage implements EngineClient {
  scene = new Scene();
  camera = new PerspectiveCamera(28, 1, 0.1, 50);

  private ctx: ViewContext | null = null;
  private tiltGroup = new Group();
  private spinGroup = new Group();
  private material: ShaderMaterial;
  private mesh: Mesh | null = null;
  private model = "";
  private initialModel: string;
  private loadToken = 0;
  private disposed = false;
  private compiled = false;

  private autoRotate: number;
  private baseTilt: number;
  private spin = 0;
  private dragVelocity = 0;
  private extraSpin = 0;
  private pointerX = 0;
  private pointerY = 0;
  private dragTiltTarget = 0;
  private dragTilt: number;
  private roll = 0;
  private zoom = 1;
  private zoomTarget = 1;
  private appear = 0;
  private appearTarget = 0;
  private fill: number;
  private baseDistance = 6;
  private interactive: boolean;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(options: DiamondOptions) {
    this.initialModel = options.model;
    this.autoRotate = options.autoRotate ?? 0.35;
    this.baseTilt = options.tilt ?? 0.55;
    this.dragTilt = this.baseTilt;
    this.interactive = options.interactive ?? false;
    this.fill = options.fill ?? 0.78;

    this.material = new ShaderMaterial({
      vertexShader: diamondVertexShader,
      fragmentShader: diamondFragmentShader,
      side: FrontSide,
      transparent: true,
      uniforms: {
        bvh: { value: new MeshBVHUniformStruct() },
        uModel: { value: new Matrix4() },
        uModelInverse: { value: new Matrix4() },
        uIor: { value: 2.417 },
        uBounces: { value: 4 },
        uExposure: { value: 1.1 },
        uEnvSpin: { value: 0 },
        uOpacity: { value: 1 },
      },
    });
    this.scene.add(this.tiltGroup);
    this.tiltGroup.add(this.spinGroup);
    this.camera.position.set(0, 0, 6);
    this.camera.lookAt(0, 0, 0);
  }

  attach(ctx: ViewContext) {
    this.ctx = ctx;
    this.setModel(this.initialModel);
  }

  /* ------------------------------ commands ------------------------------ */

  call(method: string, args: unknown[]) {
    const [a, b] = args as number[];
    switch (method) {
      case "setModel":
        this.setModel(String(args[0]));
        break;
      case "setAutoRotate":
        this.autoRotate = a;
        break;
      case "setExtraSpin":
        if (a === this.extraSpin) return;
        this.extraSpin = a;
        break;
      case "setPointer":
        this.pointerX = a;
        this.pointerY = b;
        break;
      case "setZoom":
        this.zoomTarget = a;
        break;
      case "resetView":
        this.spin = 0;
        this.dragTiltTarget = 0;
        this.zoomTarget = 1;
        this.dragVelocity = 0;
        break;
    }
    this.ctx?.invalidate();
  }

  pointer(type: "down" | "move" | "up", x: number, y: number) {
    if (!this.interactive) return;
    if (type === "down") {
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
      this.dragVelocity = 0;
    } else if (type === "move" && this.dragging) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      const d = dx * 0.009;
      this.spin += d;
      this.dragVelocity = d * 60;
      this.dragTiltTarget = Math.max(-0.6, Math.min(0.9, this.dragTiltTarget + dy * 0.006));
    } else if (type === "up") {
      this.dragging = false;
    }
    this.ctx?.invalidate();
  }

  private async setModel(model: string) {
    if (model === this.model || !this.ctx) return;
    this.model = model;
    const token = ++this.loadToken;
    try {
      this.appearTarget = 0;
      this.ctx.invalidate();
      const asset = await loadDiamondAsset(model);
      if (this.disposed || token !== this.loadToken) return;

      if (this.mesh) {
        // Let the outgoing stone dissolve before swapping geometry
        const start = performance.now();
        while (this.appear > 0.04 && performance.now() - start < 700 && !this.disposed) await delay(16);
      }
      if (this.disposed || token !== this.loadToken) return;

      this.material.uniforms.bvh.value = asset.uniform;
      if (!this.mesh) {
        this.mesh = new Mesh(asset.geometry, this.material);
        this.mesh.frustumCulled = false;
        this.spinGroup.add(this.mesh);
        await this.ctx.compile().catch(() => undefined);
        if (this.disposed) return;
        this.compiled = true;
        this.appear = 0;
        this.ctx.emit("ready");
      } else {
        this.mesh.geometry = asset.geometry;
      }
      this.fitToView();
      this.appearTarget = 1;
      this.ctx.invalidate();
    } catch (error) {
      if (!this.disposed) this.ctx?.emit("error", String(error));
    }
  }

  /* ------------------------------ engine ------------------------------- */

  update(dt: number): boolean {
    if (!this.mesh || !this.compiled || !this.ctx) return false;
    let moving = false;
    const turntable = this.ctx.quality().autoRotate ? this.autoRotate : 0;

    if (!this.dragging) {
      this.spin += turntable * dt + this.dragVelocity * dt;
      this.dragVelocity = damp(this.dragVelocity, 0, 2.5, dt);
      if (Math.abs(this.dragVelocity) > 0.001) moving = true;
      if (Math.abs(this.dragTiltTarget) > 0.001) {
        this.dragTiltTarget = damp(this.dragTiltTarget, 0, 0.6, dt);
        moving = true;
      }
    }
    if (turntable !== 0) moving = true;
    this.spinGroup.rotation.y = this.spin + this.extraSpin;

    const tiltTarget = this.baseTilt + this.pointerY * 0.12 + this.dragTiltTarget;
    this.dragTilt = damp(this.dragTilt, tiltTarget, 6, dt);
    const rollTarget = -this.pointerX * 0.1;
    this.roll = damp(this.roll, rollTarget, 6, dt);
    this.tiltGroup.rotation.set(this.dragTilt, 0, this.roll);
    if (Math.abs(this.dragTilt - tiltTarget) > 0.0005 || Math.abs(this.roll - rollTarget) > 0.0005) moving = true;

    const z = damp(this.zoom, this.zoomTarget, 7, dt);
    if (Math.abs(z - this.zoom) > 0.0002) moving = true;
    this.zoom = z;
    this.camera.position.z = this.baseDistance / this.zoom;

    const a = damp(this.appear, this.appearTarget, this.appearTarget > this.appear ? 4.5 : 9, dt);
    if (Math.abs(a - this.appearTarget) > 0.002) moving = true;
    this.appear = a;
    const eased = 1 - Math.pow(1 - a, 3);
    this.spinGroup.scale.setScalar(0.86 + 0.14 * eased);
    this.material.uniforms.uOpacity.value = eased;
    return moving;
  }

  prepare(quality: QualitySettings) {
    if (!this.mesh) return;
    this.scene.updateMatrixWorld();
    this.material.uniforms.uModel.value.copy(this.mesh.matrixWorld);
    this.material.uniforms.uModelInverse.value.copy(this.mesh.matrixWorld).invert();
    this.material.uniforms.uBounces.value = quality.bounces;
  }

  setViewport(w: number, h: number) {
    this.camera.aspect = Math.max(1, w) / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.fitToView();
  }

  dispose() {
    this.disposed = true;
    this.material.dispose();
  }

  private fitToView() {
    const radius = this.mesh?.geometry.boundingSphere?.radius ?? 1.1;
    const fov = (this.camera.fov * Math.PI) / 180;
    const fitHeight = radius / Math.tan(fov / 2);
    const fitWidth = fitHeight / Math.min(Math.max(this.camera.aspect, 0.01), 1);
    this.baseDistance = Math.max(fitHeight, fitWidth) / this.fill;
    this.camera.position.z = this.baseDistance / this.zoom;
  }
}
