/** Coordinates page entrance animations with the first-visit preloader. */
type IntroWindow = Window & { __novvaIntroDone?: boolean };

export function markIntroDone() {
  (window as IntroWindow).__novvaIntroDone = true;
  window.dispatchEvent(new Event("novva:intro-done"));
}

export function onIntroDone(cb: () => void): () => void {
  if ((window as IntroWindow).__novvaIntroDone) {
    cb();
    return () => undefined;
  }
  const handler = () => cb();
  window.addEventListener("novva:intro-done", handler, { once: true });
  return () => window.removeEventListener("novva:intro-done", handler);
}
