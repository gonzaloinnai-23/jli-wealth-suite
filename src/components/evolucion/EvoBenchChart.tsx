import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { benchRetForWeights, getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import {
  BENCH_BOND,
  BENCH_BOND_USD,
  BENCH_GOLD,
  BENCH_MSCI,
  BENCH_EM,
} from "../../data/constants";
import { buildClassSeries, type EvoClass } from "./evolucion-helpers";

type FilterKey = "all" | "rv" | "rf" | "gold" | "alt";

const FILTER_MAP: Record<Exclude<FilterKey, "all">, { cn: EvoClass; benchName: string }> = {
  rv: { cn: "Renta Variable", benchName: "Benchmark RV (MSCI World + EM)" },
  rf: { cn: "Renta Fija", benchName: "Benchmark Agg Bond (EUR+USD)" },
  gold: { cn: "Oro / Materias Primas", benchName: "Benchmark Oro (XAU/EUR)" },
  alt: { cn: "Alternativos", benchName: "Benchmark Oro (XAU/EUR)" },
};

/**
 * Cartera vs Benchmark Replicado — 2 lines + alpha area on a secondary axis.
 * Toggles: real € vs TWR only, and per-class filter.
 * Ports the `evoBenchChart` block from `renderEvolucion`.
 */
export function EvoBenchChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const aa = d.asset_alloc;
    const twr = d.twr_series;
    const { active, series } = buildClassSeries(state.port, months);
    const realTotalsAll = months.map((_, idx) =>
      active.reduce((s, cn) => s + (series[cn][idx] || 0), 0)
    );

    const benchRetForMonth = (mi: string) => {
      const w: Record<string, number> = {
        RV: aa.RV[mi] || 0,
        RF: aa.RF[mi] || 0,
        ALT: aa.ALT[mi] || 0,
        CASH: aa.CASH[mi] || 0,
        MULTI: aa.MULTI[mi] || 0,
        RF_USD: aa.RF_USD[mi] || 0,
        RF_EUR: aa.RF_EUR[mi] || 0,
        GOLD: aa.GOLD[mi] || 0,
        EM: aa.EM[mi] || 0,
      };
      const total = w.RV + w.RF + w.ALT + w.CASH + w.MULTI;
      if (total <= 0) return 0;
      return benchRetForWeights(w, mi);
    };

    const rfBenchFn = (mi: string) => {
      const rfusd = aa.RF_USD[mi] || 0;
      const rfeur = aa.RF_EUR[mi] || 0;
      const rfTotal = rfusd + rfeur;
      if (!rfTotal) return BENCH_BOND[mi] || 0;
      return (rfeur / rfTotal) * (BENCH_BOND[mi] || 0) + (rfusd / rfTotal) * (BENCH_BOND_USD[mi] || 0);
    };
    const rvBenchFn = (mi: string) => {
      const rvTotal = aa.RV[mi] || 0;
      const em = aa.EM[mi] || 0;
      if (!rvTotal) return BENCH_MSCI[mi] || 0;
      const wEM = em / rvTotal;
      const wWorld = 1 - wEM;
      return wWorld * (BENCH_MSCI[mi] || 0) + wEM * (BENCH_EM[mi] || 0);
    };

    const FMAP_FN: Record<Exclude<FilterKey, "all">, (mi: string) => number> = {
      rv: rvBenchFn,
      rf: rfBenchFn,
      gold: (mi) => BENCH_GOLD[mi] || 0,
      alt: (mi) => BENCH_GOLD[mi] || 0,
    };

    let portLine: (number | null)[];
    let benchLine: (number | null)[];
    let portLabel: string;
    let benchLabel: string;
    let isIndexed = false;
    const filter = state.evoBenchFilter as FilterKey;
    const rawTotal0 = realTotalsAll[0];

    if (filter !== "all") {
      const fcfg = FILTER_MAP[filter];
      const clsVals = months.map((_, idx) => series[fcfg.cn]?.[idx] || 0);
      const firstIdx = clsVals.findIndex((v) => v > 0);
      portLabel = fcfg.cn;
      benchLabel = fcfg.benchName;
      if (firstIdx < 0) {
        portLine = months.map(() => 0);
        benchLine = months.map(() => 0);
      } else {
        portLine = months.map((_, idx) => (idx < firstIdx ? null : clsVals[idx]));
        benchLine = [];
        for (let idx = 0; idx < months.length; idx++) {
          if (idx < firstIdx) {
            benchLine.push(null);
            continue;
          }
          if (idx === firstIdx) {
            benchLine.push(clsVals[firstIdx]);
            continue;
          }
          const prevCls = clsVals[idx - 1];
          const prevTotal = realTotalsAll[idx - 1];
          const portTwr = (twr[months[idx]] || 0) / 100;
          const totalNetFlow = realTotalsAll[idx] - realTotalsAll[idx - 1] * (1 + portTwr);
          const classWeight = prevTotal > 0 ? prevCls / prevTotal : 0;
          const netFlowCls = totalNetFlow * classWeight;
          const prevBench = benchLine[idx - 1] as number;
          benchLine.push(prevBench * (1 + FMAP_FN[filter](months[idx]) / 100) + netFlowCls);
        }
      }
    } else {
      portLabel = "Cartera";
      benchLabel = "Benchmark Replicado";
      if (state.evoBenchMode === "twr") {
        portLine = [rawTotal0];
        benchLine = [rawTotal0];
        for (let idx = 1; idx < months.length; idx++) {
          portLine.push((portLine[idx - 1] as number) * (1 + (twr[months[idx]] || 0) / 100));
          benchLine.push(
            (benchLine[idx - 1] as number) * (1 + benchRetForMonth(months[idx]) / 100)
          );
        }
      } else {
        portLine = realTotalsAll;
        benchLine = [realTotalsAll[0]];
        for (let idx = 1; idx < months.length; idx++) {
          const prevReal = realTotalsAll[idx - 1];
          const retEffect = (prevReal * (twr[months[idx]] || 0)) / 100;
          const newMoney = realTotalsAll[idx] - prevReal - retEffect;
          benchLine.push(
            (benchLine[idx - 1] as number) * (1 + benchRetForMonth(months[idx]) / 100) + newMoney
          );
        }
      }
    }

    const alphaSeries = months.map((_, idx) =>
      portLine[idx] != null && benchLine[idx] != null
        ? (portLine[idx] as number) - (benchLine[idx] as number)
        : null
    );

    return {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: portLabel,
            data: portLine,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f622",
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.3,
            order: 1,
          },
          {
            label: benchLabel,
            data: benchLine,
            borderColor: "#f59e0b",
            backgroundColor: "#f59e0b22",
            borderWidth: 2,
            borderDash: [6, 3],
            pointRadius: 0,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.3,
            order: 2,
          },
          {
            label: "Diferencia (α)",
            data: alphaSeries,
            borderColor: "#34d39966",
            backgroundColor: "#34d39911",
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
            tension: 0.3,
            yAxisID: "y2",
            order: 3,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", boxWidth: 12, font: { size: 11 }, padding: 10 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const ds = ctx.dataset as any;
                if (ds.yAxisID === "y2") {
                  const v = ctx.raw as number | null;
                  if (v == null) return "";
                  return "Alpha: " + (v >= 0 ? "+" : "") + fmt(v);
                }
                if (ctx.raw == null) return "";
                return ds.label + ": " + fmt(ctx.raw as number);
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            position: "left",
            ticks: { color: "#64748b", callback: (v) => fmt(v as number) },
            grid: { color: "#293548" },
          },
          y2: {
            position: "right",
            ticks: {
              color: "#34d39988",
              font: { size: 10 },
              callback: (v) => (Number(v) >= 0 ? "+" : "") + fmt(v as number),
            },
            grid: { display: false },
            title: {
              display: true,
              text: "Alpha (€)",
              color: "#34d39988",
              font: { size: 10 },
            },
          },
        },
      },
    };
  }, [state.port, months, state.evoBenchMode, state.evoBenchFilter]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
