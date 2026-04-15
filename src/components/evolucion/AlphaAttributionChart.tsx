import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import {
  BENCH_MSCI,
  BENCH_BOND,
  BENCH_BOND_USD,
  BENCH_6040,
  BENCH_GOLD,
} from "../../data/constants";
import { buildClassSeries } from "./evolucion-helpers";

interface AttrItem {
  label: string;
  value: number;
  color: string;
  weight: string;
  desc: string;
}

const RF_TYPES_ATTR = [
  "Cartera Gestionada RF",
  "Fondo Renta Fija",
  "Renta Fija Directa",
  "Fondo Monetario",
];
const isRfUsdProd = (name: string) => /USD|U\.S\.|US Treasury/i.test(name);

interface AttrClass {
  tipos: string[];
  bench: "MSCI" | "BOND" | "BOND_USD" | "6040" | "GOLD" | "MIX";
  color: string;
  prodFilter?: (p: { producto: string }) => boolean;
}

const ATTR_CLASSES: Record<string, AttrClass> = {
  "Renta Variable": {
    tipos: ["Fondo Renta Variable", "ETF Renta Variable", "Cartera Gestionada RV"],
    bench: "MSCI",
    color: "#f472b6",
  },
  "RF en Euro": {
    tipos: RF_TYPES_ATTR,
    bench: "BOND",
    color: "#60a5fa",
    prodFilter: (p) => !isRfUsdProd(p.producto),
  },
  "RF en Dólar": {
    tipos: RF_TYPES_ATTR,
    bench: "BOND_USD",
    color: "#38bdf8",
    prodFilter: (p) => isRfUsdProd(p.producto),
  },
  "Oro / Mat. Primas": {
    tipos: ["ETF Materias Primas", "Vehículo Alternativo"],
    bench: "GOLD",
    color: "#fbbf24",
    prodFilter: (p) => /gold|oro|xtrackers.*physical/i.test(p.producto),
  },
  Alternativos: {
    tipos: ["Vehículo Alternativo"],
    bench: "MIX",
    color: "#f87171",
    prodFilter: (p) => !/gold|oro|xtrackers.*physical/i.test(p.producto),
  },
  Multiactivo: { tipos: ["Fondo Multiactivo"], bench: "6040", color: "#a78bfa" },
};

function benchRetForClass(mi: string, kind: AttrClass["bench"]): number {
  const rMSCI = BENCH_MSCI[mi] || 0;
  const rBOND = BENCH_BOND[mi] || 0;
  const rBONDUSD = BENCH_BOND_USD[mi] || 0;
  const r6040 = BENCH_6040[mi] || 0;
  const rGOLD = BENCH_GOLD[mi] || 0;
  switch (kind) {
    case "MSCI":
      return rMSCI;
    case "BOND":
      return rBOND;
    case "BOND_USD":
      return rBONDUSD;
    case "6040":
      return r6040;
    case "GOLD":
      return rGOLD;
    case "MIX":
      return (rMSCI + rBONDUSD) / 2;
  }
}

/**
 * Alpha attribution — per-class selection alpha + cash drag. The original
 * renders this as a waterfall; we render it as a horizontal bar chart which
 * conveys the same information (contribution to total alpha).
 */
export function AlphaAttributionChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { config, items, total } = useMemo(() => {
    const d = getEnriched(state.port);
    const aa = d.asset_alloc;
    const { active, series } = buildClassSeries(state.port, months);
    const attrItems: AttrItem[] = [];

    Object.entries(ATTR_CLASSES).forEach(([clsName, cls]) => {
      const prods = d.products.filter(
        (p) => cls.tipos.includes(p.tipologia) && (!cls.prodFilter || cls.prodFilter(p))
      );
      if (prods.length === 0) return;

      let sumWeight = 0;
      let countW = 0;
      let cumClassReturn = 0;
      let cumBenchReturn = 0;

      months.forEach((mi, idx) => {
        if (idx === 0) return;
        let classVal = 0;
        prods.forEach((p) => (classVal += (p.valor && p.valor[mi]) || 0));
        const totalAll = active.reduce((s, cn) => s + (series[cn][idx] || 0), 0);
        const weight = totalAll > 0 ? classVal / totalAll : 0;
        sumWeight += weight;
        countW += 1;

        let classStart = 0;
        let classEnd = 0;
        prods.forEach((p) => {
          const ev = (p.valor && p.valor[mi]) || 0;
          if (ev <= 0) return;
          const raw = p.difmes && p.difmes[mi];
          const dm = raw != null && Math.abs(raw) < 50 ? raw : 0;
          classStart += ev / (1 + dm / 100);
          classEnd += ev;
        });
        const classRet = classStart > 0 ? (classEnd / classStart - 1) * 100 : 0;
        const benchCls = benchRetForClass(mi, cls.bench);
        cumClassReturn += (classRet * weight) / 100;
        cumBenchReturn += (benchCls * weight) / 100;
      });

      const avgWeight = countW > 0 ? sumWeight / countW : 0;
      const selectionAlpha = (cumClassReturn - cumBenchReturn) * 100;
      if (Math.abs(selectionAlpha) > 0.001) {
        attrItems.push({
          label: clsName,
          value: selectionAlpha,
          color: cls.color,
          weight: (avgWeight * 100).toFixed(1) + "%",
          desc: selectionAlpha > 0 ? "Fondos superan al índice" : "Fondos por debajo del índice",
        });
      }
    });

    // Cash drag
    let cashDragPct = 0;
    months.forEach((mi, idx) => {
      if (idx === 0) return;
      const cashVal = aa.CASH[mi] || 0;
      const totalAll = active.reduce((s, cn) => s + (series[cn][idx] || 0), 0);
      const cashWeight = totalAll > 0 ? cashVal / totalAll : 0;
      const rv = aa.RV[mi] || 0;
      const rf = aa.RF[mi] || 0;
      const alt = aa.ALT[mi] || 0;
      const multi = aa.MULTI[mi] || 0;
      const rfusd = aa.RF_USD[mi] || 0;
      const rfeur = aa.RF_EUR[mi] || 0;
      const nonCash = rv + rf + alt + multi;
      if (nonCash <= 0) return;
      const rMSCI = BENCH_MSCI[mi] || 0;
      const rBOND = BENCH_BOND[mi] || 0;
      const rBONDUSD = BENCH_BOND_USD[mi] || 0;
      const r6040 = BENCH_6040[mi] || 0;
      const rGOLD = BENCH_GOLD[mi] || 0;
      const gold = aa.GOLD[mi] || 0;
      const altOther = alt - gold;
      const em = aa.EM[mi] || 0;
      const rvWorld = rv - em;
      const nonCashBench =
        (rvWorld / nonCash) * rMSCI +
        (em / nonCash) * (BENCH_MSCI[mi] || 0) + // approximation
        (rfeur / nonCash) * rBOND +
        (rfusd / nonCash) * rBONDUSD +
        (gold / nonCash) * rGOLD +
        (altOther / nonCash) * ((rMSCI + rBONDUSD) / 2) +
        (multi / nonCash) * r6040;
      cashDragPct += (cashWeight * -nonCashBench) / 100;
    });
    cashDragPct *= 100;
    if (Math.abs(cashDragPct) > 0.001) {
      attrItems.push({
        label: "Cash Drag",
        value: cashDragPct,
        color: "#64748b",
        weight: "—",
        desc: "Coste de mantener liquidez",
      });
    }

    attrItems.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const tot = attrItems.reduce((s, x) => s + x.value, 0);

    const cfg: ChartConfiguration = {
      type: "bar",
      data: {
        labels: attrItems.map((i) => i.label),
        datasets: [
          {
            data: attrItems.map((i) => i.value),
            backgroundColor: attrItems.map((i) => i.color),
            borderWidth: 0,
            barThickness: 24,
            borderRadius: 3,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = attrItems[ctx.dataIndex];
                const v = ctx.raw as number;
                return (
                  item.label +
                  ": " +
                  (v >= 0 ? "+" : "") +
                  v.toFixed(2) +
                  " pp · " +
                  item.desc
                );
              },
              footer: (items) => "Peso medio: " + attrItems[items[0].dataIndex].weight,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#64748b",
              callback: (v) => (Number(v) >= 0 ? "+" : "") + Number(v).toFixed(1) + " pp",
            },
            grid: { color: "#1e293b" },
          },
          y: {
            ticks: { color: "#e2e8f0", font: { size: 11, weight: "bold" } },
            grid: { display: false },
          },
        },
      },
    };

    return { config: cfg, items: attrItems, total: tot };
  }, [state.port, months]);

  const canvasRef = useChart(config);

  return (
    <>
      <div style={{ height: Math.max(180, items.length * 36) }}>
        <canvas ref={canvasRef} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          padding: "6px 10px",
          background: "#0f172a",
          borderRadius: 6,
          fontSize: 12,
          color: "#e2e8f0",
        }}
      >
        <span style={{ fontWeight: 700 }}>Alpha total</span>
        <span style={{ fontWeight: 700, color: total >= 0 ? "#34d399" : "#f87171" }}>
          {(total >= 0 ? "+" : "") + total.toFixed(2) + " pp"}
        </span>
      </div>
    </>
  );
}
