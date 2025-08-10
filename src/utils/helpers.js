// Identifiant simple
export const uid = () => Math.random().toString(36).slice(2, 9);

// Deep clone safe pour notre état
export const clone = (obj) => JSON.parse(JSON.stringify(obj));

// debounce simple
export function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
