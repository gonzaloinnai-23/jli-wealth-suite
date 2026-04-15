import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { computeFxSeries } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { EURUSD } from "../../data/constants";

/**
 * Exposición USD por Clase de Activo — stacked bar chart showing the
 * per-month USD exposure split between RV, RF en USD, Alternativos and
 * Multiactivo. Ports the default view of the `fxByClass` chart (the
 * drilldown variant that replaces it when a class filter is active is left
 * out of this first pass).
 */
export function FxByClassChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const fx = computeFxSeries(state.port, months, EURUSD);
    return {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Renta Variable",
            data: fx.usdByClass.RV,
            backgroundColor: "rgba(244,114,182,0.75)",
            borderColor: "#f472b6",
            borderWidth: 1,
            borderRadius: 2,
            stack: "usd",
          },
          {
            label: "RF en Dólar",
            data: fx.usdByClass.RF_USD,
            backgroundColor: "rgba(96,165,250,0.75)",
            borderColor: "#60a5fa",
            borderWidth: 1,
            borderRadius: 2,
            stack: "usd",
          },
          {
            label: "Alternativos / Oro",
            data: fx.usdByClass.ALT,
            backgroundColor: "rgba(251,191,36,0.75)",
            borderColor: "#fbbf24",
            borderWidth: 1,
            borderRadius: 2,
            stack: "usd",
          },
          {
            label: "Multiactivo",
            data: fx.usdByClass.MULTI,
            backgroundColor: "rgba(167,139,250,0.75)",
            borderColor: "#a78bfa",
            borderWidth: 1,
            borderRadius: 2,
            stack: "usd",
          },
        ],
      },
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
                const pct = ctx.raw as number;
                if (pct == null) return "";
                const classKey = ["RV", "RF_USD", "ALT", "MULTI"][ctx.datasetIndex] as
                  | "RV"
                  | "RF_USD"
                  | "ALT"
                  | "MULTI";
                const abs = fx.usdAbsByClass[classKey][ctx.dataIndex] || 0;
                return (
                  (ctx.dataset.label ?? "") +
                  ": " +
                  pct.toFixed(1) +
                  "% (" +
                  fmt(abs) +
                  ")"
                );
              },
              footer: (items) => {
                if (!items.length) return "";
                const i = items[0].dataIndex;
                const totAbs =
                  (fx.usdAbsByClass.RV[i] || 0) +
                  (fx.usdAbsByClass.RF_USD[i] || 0) +
                  (fx.usdAbsByClass.ALT[i] || 0) +
                  (fx.usdAbsByClass.MULTI[i] || 0);
                const totPct =
                  (fx.usdByClass.RV[i] || 0) +
                  (fx.usdByClass.RF_USD[i] || 0) +
                  (fx.usdByClass.ALT[i] || 0) +
                  (fx.usdByClass.MULTI[i] || 0);
                return "Total USD: " + totPct.toFixed(1) + "% (" + fmt(totAbs) + ")";
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#64748b", font: { size: 10 } },
            grid: { color: "#1e293b" },
          },
          y: {
            stacked: true,
            min: 0,
            ticks: {
              color: "#64748b",
              font: { size: 10 },
              callback: (v) => Number(v).toFixed(0) + "%",
            },
            grid: { color: "#293548" },
            title: {
              display: true,
              text: "% del patrimonio",
              color: "#94a3b8",
              font: { size: 10 },
            },
          },
        },
      },
    };
  }, [state.port, months]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
