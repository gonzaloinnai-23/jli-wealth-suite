import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";

/**
 * Desglose del Crecimiento: stacked bar (base + returns + new money) +
 * total-value line on top. Port of the `growth` chart from `renderResumen`.
 */
export function GrowthChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const twc = d.total_with_cc;
    const firstM = months[0];
    const baseVal = twc[firstM] || 0;
    return {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Patrimonio Inicial",
            data: months.map(() => baseVal),
            backgroundColor: "#334155",
            borderWidth: 0,
            stack: "s",
          },
          {
            label: "Rentabilidad Acumulada",
            data: months.map((mi) => d.growth_returns[mi] || 0),
            backgroundColor: "#34d399",
            borderWidth: 0,
            stack: "s",
          },
          {
            label: "Dinero Nuevo Neto",
            data: months.map((mi) => d.growth_newmoney[mi] || 0),
            backgroundColor: "#3b82f6",
            borderWidth: 0,
            stack: "s",
          },
          {
            label: "Valor Total",
            data: months.map((mi) => twc[mi] || 0),
            type: "line",
            borderColor: "#f59e0b",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
            order: 0,
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
            labels: {
              color: "#94a3b8",
              boxWidth: 12,
              font: { size: 10 },
              padding: 8,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.dataset.label + ": " + fmt(ctx.raw as number),
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
