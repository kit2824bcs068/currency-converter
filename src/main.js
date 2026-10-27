import "./style.css";
import Chart from "chart.js/auto";
import { getCurrencies, getRate, getHistory } from "./api.js";
import { getCached, setCached } from "./storage.js";
import { debounce, formatMoney } from "./utils.js";

const $ = (id) => document.getElementById(id);
const amountEl = $("amount"), fromEl = $("from"), toEl = $("to");
const resultEl = $("result"), statusEl = $("status");
let controller, chart;

async function init() {
  try {
    let list = getCached("currencies");
    if (!list) {
      list = await getCurrencies();
      setCached("currencies", list);
    }
    const options = Object.entries(list)
      .map(([code, name]) => `<option value="${code}">${code} - ${name}</option>`)
      .join("");
    fromEl.innerHTML = toEl.innerHTML = options;
    fromEl.value = "USD";
    toEl.value = "INR";
    convert();
  } catch {
    statusEl.textContent = "Could not load currencies. Check your internet.";
  }
}

async function convert() {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const amount = parseFloat(amountEl.value);
  const from = fromEl.value, to = toEl.value;

  if (!(amount > 0)) { resultEl.textContent = "Enter a valid amount"; return; }
  if (from === to) { resultEl.textContent = formatMoney(amount, to); return; }

  statusEl.textContent = "Loading...";
  try {
    const key = `rate:${from}:${to}`;
    let data = getCached(key);
    if (!data) {
      data = await getRate(from, to, signal);
      setCached(key, data);
    }
    resultEl.textContent = `${formatMoney(amount, from)} = ${formatMoney(amount * data.rate, to)}`;
    statusEl.textContent = `1 ${from} = ${data.rate} ${to} • Updated ${data.date}`;
    drawChart(from, to, signal);
  } catch (e) {
    if (e.name !== "AbortError") statusEl.textContent = "Something went wrong. Try again.";
  }
}

async function drawChart(from, to, signal) {
  try {
    const key = `hist:${from}:${to}`;
    let history = getCached(key);
    if (!history) {
      history = await getHistory(from, to, 30, signal);
      setCached(key, history);
    }
    chart?.destroy();
    chart = new Chart($("chart"), {
      type: "line",
      data: {
        labels: history.map((h) => h.date),
        datasets: [{ label: `${from} → ${to} (30 days)`, data: history.map((h) => h.rate), tension: 0.3 }],
      },
      options: { maintainAspectRatio: false },
    });
  } catch {}
}

amountEl.addEventListener("input", debounce(convert));
fromEl.addEventListener("change", convert);
toEl.addEventListener("change", convert);
$("swap").addEventListener("click", () => {
  [fromEl.value, toEl.value] = [toEl.value, fromEl.value];
  convert();
});

init();
