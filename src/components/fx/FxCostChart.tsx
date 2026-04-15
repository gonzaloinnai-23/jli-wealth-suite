import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { computeFxAvgPrice } from "../../lib/calc";
import { EURUSD } from "../../data/constants";

/**
 * Precio Medio de Compra EUR/USD — overlays the EUR/USD spot with the
 * weighted-average entry price built up over time as USD exposure accumulates.
 */
export function FxCostChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const { spot, avg } = computeFxAvgPrice(state.port, months, EURUSD);
    const lastSpot = spot[spot.length - 1];
    const lastAvg = avg[avg.length - 1];
    return {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "EUR/USD spot",
            data: spot,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34,211,238,0.06)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: "Precio medio entrada USD — " + (lastAvg ? lastAvg.toFixed(4) : ""),
            data: avg,
            borderColor: "#fb923c",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2.5,
            borderDash: [6, 3],
          },
          {
            label: "EUR/USD hoy — " + (lastSpot ? lastSpot.toFixed(4) : ""),
            data: months.map(() => lastSpot),
            borderColor: "#22d3ee",
            backgroundColor: "transparent",
            fill: false,
            pointRadius: 0,
            borderWidth: 1,
            borderDash: [2, 4],
          },
          {
            label: "Precio medio actual — " + (lastAvg ? lastAvg.toFixed(4) : ""),
            data: months.map(() => lastAvg),
            borderColor: "#fb923c",
            backgroundColor: "transparent",
            fill: false,
            pointRadius: 0,
            borderWidth: 1,
            borderDash: [2, 4],
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
                if (ctx.raw == null) return "";
                const v = (ctx.raw as number).toFixed(4);
                return (ctx.dataset as any).label.split("—")[0].trim() + ": " + v;
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            ticks: { color: "#64748b", font: { size: 10 }, callback: (v) => Number(v).toFixed(4) },
            grid: { color: "#1e293b" },
            title: { display: true, text: "EUR/USD", color: "#94a3b8", font: { size: 10 } },
          },
        },
      },
    };
  }, [state.port, months]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
