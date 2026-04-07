/**
 * Guaraníes (PYG): prefijo "Gs.", miles con punto (locale es-PY), sin decimales.
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatGuarani(value) {
  if (value === null || value === undefined || value === "") {
    return "Gs. —";
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "Gs. —";
  }
  const rounded = Math.round(n);
  return `Gs. ${rounded.toLocaleString("es-PY", { maximumFractionDigits: 0 })}`;
}

/**
 * Solo el número con separadores (sin prefijo).
 */
export function formatGuaraniAmount(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("es-PY", { maximumFractionDigits: 0 });
}
