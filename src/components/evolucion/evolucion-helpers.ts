/**
 * Helpers specific to the Evolución tab. Kept separate from `lib/calc.ts`
 * because this re-classification (reclassifying 'Vehículo Alternativo' with
 * Gold in the name into "Oro / Materias Primas", and splitting Fondo
 * Multiactivo 50/50) is unique to this view.
 */
import type { Product, MonthLabel } from "../../data/portfolio";
import { getEnriched } from "../../lib/calc";
import { MULTI_SPLIT } from "../../data/constants";

export type EvoClass =
  | "Renta Variable"
  | "Renta Fija"
  | "Oro / Materias Primas"
  | "Alternativos"
  | "Liquidez";

export const EVO_CLASSES: Record<EvoClass, { color: string; multiPct: number }> = {
  "Renta Variable": { color: "#f472b6", multiPct: (MULTI_SPLIT as any).RV },
  "Renta Fija": { color: "#60a5fa", multiPct: (MULTI_SPLIT as any).RF },
  "Oro / Materias Primas": { color: "#fbbf24", multiPct: 0 },
  Alternativos: { color: "#f87171", multiPct: 0 },
  Liquidez: { color: "#64748b", multiPct: 0 },
};

export function evoClassOf(p: Product): EvoClass | "__MULTI__" {
  const t = p.tipologia || "";
  if (t === "Fondo Renta Variable" || t === "ETF Renta Variable" || t === "Cartera Gestionada RV")
    return "Renta Variable";
  if (
    t === "Cartera Gestionada RF" ||
    t === "Fondo Renta Fija" ||
    t === "Renta Fija Directa" ||
    t === "Fondo Monetario"
  )
    return "Renta Fija";
  if (t === "ETF Materias Primas") return "Oro / Materias Primas";
  if (t === "Vehículo Alternativo") {
    return /gold/i.test(p.producto || "") ? "Oro / Materias Primas" : "Alternativos";
  }
  if (t === "Fondo Multiactivo") return "__MULTI__";
  if (t === "Cuenta Corriente") return "Liquidez";
  return "Alternativos";
}

/** Per-class monthly series, with multiactivo split baked in. */
export function buildClassSeries(
  port: "bca" | "bcp",
  months: MonthLabel[]
): { classNames: EvoClass[]; active: EvoClass[]; series: Record<EvoClass, number[]> } {
  const d = getEnriched(port);
  const classNames = Object.keys(EVO_CLASSES) as EvoClass[];
  const series: Record<EvoClass, number[]> = {
    "Renta Variable": [],
    "Renta Fija": [],
    "Oro / Materias Primas": [],
    Alternativos: [],
    Liquidez: [],
  };
  months.forEach((mi) => {
    const sums: Record<EvoClass, number> = {
      "Renta Variable": 0,
      "Renta Fija": 0,
      "Oro / Materias Primas": 0,
      Alternativos: 0,
      Liquidez: 0,
    };
    let multiVal = 0;
    d.products.forEach((p) => {
      const v = (p.valor && p.valor[mi]) || 0;
      if (!v) return;
      const cls = evoClassOf(p);
      if (cls === "__MULTI__") {
        multiVal += v;
        return;
      }
      sums[cls] += v;
    });
    classNames.forEach((cn) => {
      series[cn].push(sums[cn] + multiVal * EVO_CLASSES[cn].multiPct);
    });
  });
  const active = classNames.filter((cn) => series[cn].some((v) => v > 0));
  return { classNames, active, series };
}
