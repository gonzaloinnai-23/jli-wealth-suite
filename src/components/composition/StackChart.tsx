import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { TIPO_COLORS } from "../../data/constants";

/**
 * Evolución Patrimonial por Tipología — stacked area chart with one series
 * per product tipologia (excluding Cuenta Corriente). Port of the `stack`
 * chart from `renderResumen`.
 */
export function StackChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const tipos = Object.keys(d.tipo_series).filter((t) => t !== "Cuenta Corriente");
    const datasets = tipos.map((t) => ({
      label: t,
      data: months.map((mi) => d.tipo_series[t][mi] || 0),
      backgroundColor: (TIPO_COLORS as Record<string, string>)[t] || "#475569",
      borderColor: "transparent",
      fill: true,
      pointRadius: 0,
    }));
    return {
      type: "line",
      data: { labels: months, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", boxWidth: 12, font: { size: 10 }, padding: 8 },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            stacked: true,
            ticks: { color: "#64748b", callback: (v) => fmt(v as number) },
            grid: { color: "#293548" },
          },
        },
      },
    };
  }, [state.port, months]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
