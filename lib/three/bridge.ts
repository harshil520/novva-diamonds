import { getTier, startLevel } from "./quality";
import type { FromWorker, ToWorker, ViewKind } from "./engine/types";

export type ViewListener = (event: string, data?: unknown) => void;

export interface ViewHandle {
  setActive(active: boolean): void;
  resize(width: number, height: number): void;
  call(method: string, ...args: unknown[]): void;
  pointer(kind: "down" | "move" | "up", x: number, y: number): void;
  dispose(): void;
}

interface Backend {
  mode: "worker" | "main";
  create(id: number, kind: ViewKind, canvas: HTMLCanvasElement, w: number, h: number, options: Record<string, unknown>, listener: ViewListener): void;
  send(msg: ToWorker): void;
}

let nextId = 1;
let backend: Promise<Backend> | null = null;

/**
 * OffscreenCanvas in workers: Chrome/Edge 69+, Firefox 105+, Safari 16.4+.
 * No WebGL probe here (creating a context on the main thread is exactly the cost
 * we avoid); if the worker cannot get WebGL it reports an error and the view
 * falls back to its photograph.
 */
function workerCapable(): boolean {
  try {
    return (
      typeof Worker !== "undefined" &&
      typeof OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in HTMLCanvasElement.prototype
    );
  } catch {
    return false;
  }
}

function getBackend(): Promise<Backend> {
  if (backend) return backend;
  backend = (async (): Promise<Backend> => {
    const level = startLevel(getTier());

    if (workerCapable()) {
      const worker = new Worker(new URL("./engine/render.worker.ts", import.meta.url), { name: "novva-3d" });
      const listeners = new Map<number, ViewListener>();
      worker.onmessage = (e: MessageEvent<FromWorker>) => listeners.get(e.data.id)?.(e.data.event, e.data.data);
      worker.onerror = () => listeners.forEach((l) => l("error", "worker failed"));
      worker.postMessage({ type: "init", level } satisfies ToWorker);
      document.addEventListener("visibilitychange", () =>
        worker.postMessage({ type: "visibility", hidden: document.hidden } satisfies ToWorker)
      );
      return {
        mode: "worker",
        create(id, kind, canvas, w, h, options, listener) {
          listeners.set(id, listener);
          const offscreen = canvas.transferControlToOffscreen();
          const msg: ToWorker = { type: "create", id, kind, canvas: offscreen, width: w, height: h, dpr: window.devicePixelRatio || 1, options };
          worker.postMessage(msg, [offscreen]);
        },
        send(msg) {
          worker.postMessage(msg);
          if (msg.type === "dispose") listeners.delete(msg.id);
        },
      };
    }

    // Fallback: same engine on the main thread (still idle-scheduled and governed)
    const [{ Scheduler }, stage, { GlobeStage }] = await Promise.all([
      import("./engine/scheduler"),
      import("@/lib/diamond/stage"),
      import("./globe"),
    ]);
    const scheduler = new Scheduler(level);
    document.addEventListener("visibilitychange", () => scheduler.setHidden(document.hidden));
    return {
      mode: "main",
      create(id, kind, canvas, w, h, options, listener) {
        const client =
          kind === "diamond" ? new stage.DiamondStage(options as unknown as import("@/lib/diamond/stage").DiamondOptions) : new GlobeStage();
        scheduler.createView(id, canvas, client, w, h, window.devicePixelRatio || 1, listener);
      },
      send(msg) {
        switch (msg.type) {
          case "resize":
            scheduler.resize(msg.id, msg.width, msg.height, msg.dpr);
            break;
          case "active":
            scheduler.setActive(msg.id, msg.active);
            break;
          case "call":
            scheduler.call(msg.id, msg.method, msg.args);
            break;
          case "pointer":
            scheduler.pointer(msg.id, msg.kind, msg.x, msg.y);
            break;
          case "dispose":
            scheduler.dispose(msg.id);
            break;
          case "prefetch":
            stage.prefetchDiamondAssets(msg.models);
            break;
        }
      },
    };
  })();
  return backend;
}

export async function createView(
  kind: ViewKind,
  canvas: HTMLCanvasElement,
  size: { width: number; height: number },
  options: Record<string, unknown>,
  listener: ViewListener
): Promise<ViewHandle> {
  const b = await getBackend();
  const id = nextId++;
  b.create(id, kind, canvas, size.width, size.height, options, listener);
  return {
    setActive: (active) => b.send({ type: "active", id, active }),
    resize: (width, height) => b.send({ type: "resize", id, width, height, dpr: window.devicePixelRatio || 1 }),
    call: (method, ...args) => b.send({ type: "call", id, method, args }),
    pointer: (kind, x, y) => b.send({ type: "pointer", id, kind, x, y }),
    dispose: () => b.send({ type: "dispose", id }),
  };
}

/** Warm diamond geometry (in the worker when available) */
export function prefetchModels(models: string[]) {
  if (getTier() === "none") return;
  getBackend()
    .then((b) => b.send({ type: "prefetch", models }))
    .catch(() => undefined);
}
