import { SRGBColorSpace, WebGLRenderer } from "three";
import { QUALITY_LADDER, type QualitySettings } from "../quality";
import type { EngineClient, ViewContext } from "./types";

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

interface View {
  id: number;
  client: EngineClient;
  renderer: WebGLRenderer;
  canvas: AnyCanvas;
  cssW: number;
  cssH: number;
  dpr: number;
  active: boolean;
  dirty: boolean;
  failed: boolean;
}

const g = globalThis as typeof globalThis & {
  requestAnimationFrame?: (cb: (t: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
};
const raf = (cb: (t: number) => void): number =>
  g.requestAnimationFrame ? g.requestAnimationFrame(cb) : (setTimeout(() => cb(performance.now()), 16) as unknown as number);
const caf = (id: number) => (g.cancelAnimationFrame ? g.cancelAnimationFrame(id) : clearTimeout(id));

/**
 * Drives every 3D view: one loop, only on-screen views update, nothing runs
 * while idle, and a frame-time governor steps quality down (resolution →
 * bounces → frame rate → stop turntables) until frames fit the budget.
 * Environment-agnostic, so it runs inside the render worker when available.
 */
export class Scheduler {
  private views = new Map<number, View>();
  private level: number;
  private handle = 0;
  private last = 0;
  private lastDraw = 0;
  private samples: number[] = [];
  private settled = false;
  private hidden = false;

  constructor(level: number) {
    this.level = Math.max(0, Math.min(QUALITY_LADDER.length - 1, level));
  }

  get quality(): QualitySettings {
    return QUALITY_LADDER[this.level];
  }

  createView(id: number, canvas: AnyCanvas, client: EngineClient, cssW: number, cssH: number, dpr: number, emit: ViewContext["emit"]) {
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas: canvas as HTMLCanvasElement,
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      emit("error", String(e));
      return;
    }
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const view: View = { id, client, renderer, canvas, cssW, cssH, dpr, active: false, dirty: true, failed: false };
    this.views.set(id, view);

    canvas.addEventListener("webglcontextlost", ((e: Event) => {
      e.preventDefault();
      view.failed = true;
      emit("error", "context lost");
    }) as EventListener);

    client.attach({
      renderer,
      invalidate: () => {
        view.dirty = true;
        if (view.active) this.wake();
      },
      compile: () => {
        const r = renderer as WebGLRenderer & { compileAsync?: WebGLRenderer["compileAsync"] };
        return r.compileAsync ? r.compileAsync(client.scene, client.camera) : Promise.resolve(r.compile(client.scene, client.camera));
      },
      quality: () => this.quality,
      emit,
    });
    this.applySize(view);
  }

  resize(id: number, cssW: number, cssH: number, dpr: number) {
    const v = this.views.get(id);
    if (!v) return;
    v.cssW = cssW;
    v.cssH = cssH;
    v.dpr = dpr;
    this.applySize(v);
  }

  setActive(id: number, active: boolean) {
    const v = this.views.get(id);
    if (!v) return;
    v.active = active;
    if (active) {
      v.dirty = true;
      this.wake();
    }
  }

  call(id: number, method: string, args: unknown[]) {
    this.views.get(id)?.client.call(method, args);
  }

  pointer(id: number, type: "down" | "move" | "up", x: number, y: number) {
    this.views.get(id)?.client.pointer(type, x, y);
  }

  dispose(id: number) {
    const v = this.views.get(id);
    if (!v) return;
    this.views.delete(id);
    v.client.dispose();
    v.renderer.dispose();
  }

  setHidden(hidden: boolean) {
    this.hidden = hidden;
    if (hidden) this.stop();
    else this.wake();
  }

  wake() {
    if (this.handle || this.hidden) return;
    this.last = performance.now();
    this.handle = raf(this.tick);
  }

  private stop() {
    if (this.handle) caf(this.handle);
    this.handle = 0;
  }

  private applySize(v: View) {
    const q = this.quality;
    const area = Math.max(1, v.cssW * v.cssH);
    const ratio = Math.max(0.6, Math.min(q.maxDpr, v.dpr, Math.sqrt(q.pixelBudget / area)));
    v.renderer.setPixelRatio(ratio);
    v.renderer.setSize(Math.max(1, v.cssW), Math.max(1, v.cssH), false);
    v.client.setViewport(v.cssW, v.cssH, ratio);
    v.dirty = true;
    if (v.active) this.wake();
  }

  private tick = (now: number) => {
    this.handle = 0;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    const frameMs = now - this.last;
    this.last = now;
    const due = this.quality.fps === 60 || now - this.lastDraw >= 1000 / 30 - 4;

    let animating = false;
    let drew = false;
    this.views.forEach((v) => {
      if (!v.active || v.failed) return;
      const moving = v.client.update(dt, now / 1000);
      animating = animating || moving;
      if ((moving || v.dirty) && due) {
        v.client.prepare(this.quality);
        v.renderer.render(v.client.scene, v.client.camera);
        v.dirty = false;
        drew = true;
      } else if (v.dirty) {
        animating = true;
      }
    });

    if (drew) {
      this.lastDraw = now;
      this.govern(frameMs);
    }
    if (animating) this.handle = raf(this.tick);
  };

  private govern(frameMs: number) {
    if (this.settled || frameMs <= 0 || frameMs > 250) return;
    this.samples.push(frameMs);
    if (this.samples.length < 40) return;
    const sorted = [...this.samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    this.samples = [];
    const budget = this.quality.fps === 30 ? 40 : 21;
    if (median > budget && this.level < QUALITY_LADDER.length - 1) {
      this.level += 1;
      this.views.forEach((v) => this.applySize(v));
    } else if (median <= budget) {
      this.settled = true;
    }
  }
}
