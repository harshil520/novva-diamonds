/// <reference lib="webworker" />
import { Scheduler } from "./scheduler";
import { DiamondStage, prefetchDiamondAssets, type DiamondOptions } from "@/lib/diamond/stage";
import { GlobeStage } from "../globe";
import type { FromWorker, ToWorker } from "./types";

/**
 * Render worker: every WebGL context, shader compile, BVH build and frame lives
 * here, so the page's main thread is never blocked by 3D work.
 */
const ctx = self as unknown as DedicatedWorkerGlobalScope;
let scheduler: Scheduler | null = null;

const post = (msg: FromWorker) => ctx.postMessage(msg);

ctx.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.type === "init") {
    scheduler = new Scheduler(m.level);
    return;
  }
  if (!scheduler) scheduler = new Scheduler(1);
  switch (m.type) {
    case "create": {
      const client = m.kind === "diamond" ? new DiamondStage(m.options as unknown as DiamondOptions) : new GlobeStage();
      scheduler.createView(m.id, m.canvas, client, m.width, m.height, m.dpr, (event, data) =>
        post({ type: "event", id: m.id, event, data })
      );
      break;
    }
    case "resize":
      scheduler.resize(m.id, m.width, m.height, m.dpr);
      break;
    case "active":
      scheduler.setActive(m.id, m.active);
      break;
    case "call":
      scheduler.call(m.id, m.method, m.args);
      break;
    case "pointer":
      scheduler.pointer(m.id, m.kind, m.x, m.y);
      break;
    case "dispose":
      scheduler.dispose(m.id);
      break;
    case "visibility":
      scheduler.setHidden(m.hidden);
      break;
    case "prefetch":
      prefetchDiamondAssets(m.models);
      break;
  }
};
