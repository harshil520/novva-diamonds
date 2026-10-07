import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { QualitySettings } from "../quality";

/** What a 3D view receives from the scheduler that hosts it (main thread or worker). */
export interface ViewContext {
  renderer: WebGLRenderer;
  /** Request a frame */
  invalidate(): void;
  /** Compile the view's shaders without blocking (KHR_parallel_shader_compile) */
  compile(): Promise<unknown>;
  quality(): QualitySettings;
  /** Send an event to the page (ready, error, labels…) */
  emit(event: string, data?: unknown): void;
}

/** A DOM-free 3D view: runs identically on the main thread or inside a Web Worker. */
export interface EngineClient {
  scene: Scene;
  camera: PerspectiveCamera;
  attach(ctx: ViewContext): void;
  /** Advance animation; return true while still in motion */
  update(dt: number, time: number): boolean;
  /** Called right before each draw */
  prepare(quality: QualitySettings): void;
  /** CSS size of the canvas and the device-pixel ratio actually rendered */
  setViewport(cssWidth: number, cssHeight: number, pixelRatio: number): void;
  /** Imperative commands from the page (setModel, setZoom…) */
  call(method: string, args: unknown[]): void;
  pointer(type: "down" | "move" | "up", x: number, y: number): void;
  dispose(): void;
}

export type ViewKind = "diamond" | "globe";

/* Messages between the page and the render worker */
export type ToWorker =
  | { type: "init"; level: number }
  | { type: "create"; id: number; kind: ViewKind; canvas: OffscreenCanvas; width: number; height: number; dpr: number; options: Record<string, unknown> }
  | { type: "resize"; id: number; width: number; height: number; dpr: number }
  | { type: "active"; id: number; active: boolean }
  | { type: "call"; id: number; method: string; args: unknown[] }
  | { type: "pointer"; id: number; kind: "down" | "move" | "up"; x: number; y: number }
  | { type: "dispose"; id: number }
  | { type: "visibility"; hidden: boolean }
  | { type: "prefetch"; models: string[] };

export type FromWorker = { type: "event"; id: number; event: string; data?: unknown };
