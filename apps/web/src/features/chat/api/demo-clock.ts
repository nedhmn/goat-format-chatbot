const TICK_MS = 50;

let now = Date.now();

export function readClock(): number {
  return now;
}

export function clockUntil(endsAt: number): (listener: () => void) => () => void {
  return (listener) => {
    now = Date.now();
    if (now >= endsAt) return () => undefined;
    const timer = setInterval(() => {
      now = Date.now();
      listener();
      if (now >= endsAt) clearInterval(timer);
    }, TICK_MS);
    return () => clearInterval(timer);
  };
}
