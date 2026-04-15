/**
 * Formatting helpers — ported verbatim from the original `fmt`, `fmtPct`,
 * `fmtEur` and `hmColor` functions. Kept 1:1 so downstream code behaves the
 * same as in the original imperative dashboard.
 */

/** Format a number as €-prefixed currency. €XM / €XK / €X. `null` → "—". */
export function fmt(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1e6) return "€" + (v / 1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "€" + (v / 1e3).toFixed(0) + "K";
  return "€" + v.toFixed(0);
}

/** Format a number as a signed percentage with 2 decimals. */
export function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

/** Format a number as a signed €-suffixed currency. Used in attribution tables. */
export function fmtEur(v: number): string {
  const abs = Math.abs(v);
  const s =
    abs >= 1e6 ? (abs / 1e6).toFixed(2) + "M" : abs >= 1e3 ? (abs / 1e3).toFixed(0) + "K" : abs.toFixed(0);
  return (v >= 0 ? "+" : "-") + s + "€";
}

/** Red → white → green heatmap gradient for monthly returns clipped to ±6%. */
export function hmColor(v: number | null | undefined): string {
  if (v == null) return "#293548";
  const c = Math.max(-6, Math.min(6, v));
  const n = (c + 6) / 12;
  let r: number;
  let g: number;
  let b: number;
  if (n < 0.5) {
    const t = n * 2;
    r = Math.round(192 + (248 - 192) * t);
    g = Math.round(57 + (250 - 57) * t);
    b = Math.round(43 + (252 - 43) * t);
  } else {
    const t = (n - 0.5) * 2;
    r = Math.round(248 + (30 - 248) * t);
    g = Math.round(250 + (132 - 250) * t);
    b = Math.round(252 + (73 - 252) * t);
  }
  return `rgb(${r},${g},${b})`;
}

/** Tiny signed-pct helper used in a few inline calls in the original. */
export const pct = (v: number): string => (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
