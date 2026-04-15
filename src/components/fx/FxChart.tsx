import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { computeFxSeries } from "../../lib/calc";
import { EURUSD } from "../../data/constants";

const FX_CLASS_CFG: Record<
  "RV" | "RF_USD" | "ALT" | "MULTI",
  { label: string; color: string; bg: string }
> = {
  RV: {
    label: "Exp. USD — Renta Variable (70% MSCI, 99% S&P, 15% EM)",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.12)",
  },
  RF_USD: {
    label: "Exp. USD — RF en Dólar (80-100%)",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
  },
  ALT: {
    label: "Exp. USD — Alternativos (100% oro)",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
  },
  MULTI: {
    label: "Exp. USD — Multiactivo (40%)",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
  },
};

/**
 * EUR/USD + USD exposure chart. Has two modes:
 *   - "total": shows EUR/USD spot, % change vs first month, total USD
 *     exposure, and cumulative FX impact.
 *   - "byclass": shows EUR/USD spot, one class USD exposure (filtered), and
 *     total USD exposure.
 * Ports the `fx` chart + mode buttons from `renderResumen`.
 */
export function FxChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const fx = computeFxSeries(state.port, months, EURUSD);
    const fxRate = months.map((mi) => EURUSD[mi] || null);
    const fxBase = EURUSD[months[0]] || 1;
    const fxChangePct = months.map((mi) => {
      const r = EURUSD[mi];
      return r ? (r / fxBase - 1) * 100 : null;
    });

    const datasets: any[] =
      state.fxMode === "total"
        ? [
            {
              label: "EUR/USD",
              data: fxRate,
              borderColor: "#22d3ee",
              backgroundColor: "transparent",
              fill: false,
              tension: 0.3,
              pointRadius: 2,
              borderWidth: 2,
              yAxisID: "yFx",
            },
            {
              label: "Variación EUR/USD (%)",
              data: fxChangePct,
              borderColor: "#a78bfa",
              backgroundColor: "rgba(167,139,250,0.08)",
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: "yPct",
            },
            {
              label: "Exposición USD total (%)",
              data: fx.usdExpPct,
              borderColor: "#fb923c",
              backgroundColor: "transparent",
              fill: false,
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 1.5,
              borderDash: [4, 4],
              yAxisID: "yPct",
            },
            {
              label: "Impacto FX acum. (pp)",
              data: fx.fxImpactSeries,
              borderColor: "#f87171",
              backgroundColor: "rgba(248,113,113,0.08)",
              fill: true,
              tension: 0.3,
              pointRadius: 2,
              borderWidth: 2,
              yAxisID: "yPct",
            },
          ]
        : (() => {
            const sel = FX_CLASS_CFG[state.fxClass] || FX_CLASS_CFG.RV;
            return [
              {
                label: "EUR/USD",
                data: fxRate,
                borderColor: "#22d3ee",
                backgroundColor: "transparent",
                fill: false,
                tension: 0.3,
                pointRadius: 2,
                borderWidth: 2,
                yAxisID: "yFx",
              },
              {
                label: sel.label,
                data: fx.usdByClass[state.fxClass],
                borderColor: sel.color,
                backgroundColor: sel.bg,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2.5,
                yAxisID: "yPct",
              },
              {
                label: "Exposición USD total (%)",
                data: fx.usdExpPct,
                borderColor: "#fb923c",
                backgroundColor: "transparent",
                fill: false,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 1.5,
                borderDash: [5, 3],
                yAxisID: "yPct",
              },
            ];
          })();

    return {
      type: "line",
      data: { labels: months, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", boxWidth: 12, font: { size: 10 }, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const ds = ctx.dataset as any;
                const v = ctx.raw as number;
                if (ds.yAxisID === "yFx") return ds.label + ": " + v.toFixed(4);
                return ds.label + ": " + (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          yFx: {
            type: "linear",
            position: "left",
            title: { display: true, text: "EUR/USD", color: "#22d3ee", font: { size: 10 } },
            ticks: { color: "#22d3ee", font: { size: 10 } },
            grid: { color: "#1e293b" },
          },
          yPct: {
            type: "linear",
            position: "right",
            title: { display: true, text: "%", color: "#a78bfa", font: { size: 10 } },
            ticks: {
              color: "#a78bfa",
              font: { size: 10 },
              callback: (v) => (Number(v) >= 0 ? "+" : "") + Number(v).toFixed(1) + "%",
            },
            grid: { display: false },
          },
        },
      },
    };
  }, [state.port, months, state.fxMode, state.fxClass]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
