const TTL = 60 * 60 * 1000; // 1 hour

export function getCached(key) {
  try {
    const item = JSON.parse(localStorage.getItem(key));
    if (item && Date.now() - item.time < TTL) return item.data;
  } catch {}
  return null;
}

export function setCached(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
  } catch {}
}
