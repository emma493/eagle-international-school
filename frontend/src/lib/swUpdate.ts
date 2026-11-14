/** Tells the UI when a new version of the app has been downloaded and is waiting to take over. */
export const UPDATE_READY_EVENT = "eagle:update-ready";
const CHECK_EVERY_MS = 60 * 60 * 1000;

let waiting: ServiceWorker | null = null;

export function watchForUpdate(reg: ServiceWorkerRegistration) {
  const announce = () => {
    // Only an update when a worker already controls the page; the first install is not an update.
    if (reg.waiting && navigator.serviceWorker.controller) {
      waiting = reg.waiting;
      window.dispatchEvent(new Event(UPDATE_READY_EVENT));
    }
  };
  announce();
  reg.addEventListener("updatefound", () => {
    const installing = reg.installing;
    installing?.addEventListener("statechange", () => {
      if (installing.state === "installed") announce();
    });
  });
  setInterval(() => {
    reg.update().catch(() => {});
  }, CHECK_EVERY_MS);
}

export function hasWaitingUpdate(): boolean {
  return waiting !== null;
}

/** Activates the waiting worker and reloads once it has taken control. */
export function applyUpdate() {
  if (!waiting) {
    window.location.reload();
    return;
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
  waiting.postMessage({ type: "SKIP_WAITING" });
}
