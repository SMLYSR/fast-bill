type FailState = { fails: number; firstAt: number; lockedUntil?: number };

const store = new Map<string, FailState>();

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxFails = Number(process.env.RATE_LIMIT_MAX_FAILS || 5);
const lockMs = Number(process.env.RATE_LIMIT_LOCK_MS || 15 * 60 * 1000);

export const limiter = {
  isLocked(key: string) {
    const s = store.get(key);
    if (!s) return false;
    const now = Date.now();
    if (s.lockedUntil && s.lockedUntil > now) return true;
    if (s.lockedUntil && s.lockedUntil <= now) {
      store.delete(key);
      return false;
    }
    if (s.firstAt + windowMs < now) store.delete(key);
    return false;
  },
  recordFail(key: string) {
    const now = Date.now();
    const s = store.get(key);
    if (!s) {
      store.set(key, { fails: 1, firstAt: now });
      return;
    }
    const within = now - s.firstAt <= windowMs;
    if (!within) {
      store.set(key, { fails: 1, firstAt: now });
      return;
    }
    s.fails += 1;
    if (s.fails >= maxFails) s.lockedUntil = now + lockMs;
    store.set(key, s);
  },
  reset(key: string) {
    store.delete(key);
  },
};