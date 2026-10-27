export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const formatMoney = (value, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
