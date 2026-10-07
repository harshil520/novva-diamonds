"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** True only after hydration on the client — safe for portals and browser-only UI. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
