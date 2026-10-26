const BASE = "https://api.frankfurter.dev/v1";

async function request(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getCurrencies = (signal) => request(`${BASE}/currencies`, signal);

export async function getRate(from, to, signal) {
  const { rates, date } = await request(`${BASE}/latest?base=${from}&symbols=${to}`, signal);
  return { rate: rates[to], date };
}

export async function getHistory(from, to, days, signal) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const { rates } = await request(`${BASE}/${fmt(start)}..${fmt(end)}?base=${from}&symbols=${to}`, signal);
  return Object.entries(rates).map(([date, r]) => ({ date, rate: r[to] }));
}