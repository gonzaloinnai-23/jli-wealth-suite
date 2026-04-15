import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";

/**
 * Ratio RV/RF vs media histórica — line chart with 4 series:
 * % RV, % RF, and their flat horizontal averages. Ported from the `rvRf` chart
 * block at the end of `renderResumen`.
 */
export function RvRfChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const aa = d.asset_alloc;
    const rvSeries = months.map((mi) => {
      const rv = aa.RV[mi] || 0;
      const rf = aa.RF[mi] || 0;
      const alt = aa.ALT[mi] || 0;
      const cash = aa.CASH[mi] || 0;
      const multi = aa.MULTI[mi] || 0;
      const tot = rv + rf + alt + cash + multi;
      return tot > 0 ? (rv / tot) * 100 : 0;
    });
    const rfSeries = months.map((mi) => {
      const rv = aa.RV[mi] || 0;
      const rf = aa.RF[mi] || 0;
      const alt = aa.ALT[mi] || 0;
      const cash = aa.CASH[mi] || 0;
      const multi = aa.MULTI[mi] || 0;
      const tot = rv + rf + alt + cash + multi;
      return tot > 0 ? (rf / tot) * 100 : 0;
    });
    const avgRV = rvSeries.reduce((a, b) => a + b, 0) / rvSeries.length;
    const avgRF = rfSeries.reduce((a, b) => a + b, 0) / rfSeries.length;

    return {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "% RV",
            data: rvSeries,
            borderColor: "#f472b6",
            backgroundColor: "rgba(244,114,182,0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: "% RF",
            data: rfSeries,
            borderColor: "#60a5fa",
            backgroundColor: "rgba(96,165,250,0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: `Media RV (${avgRV.toFixed(0)}%)`,
            data: months.map(() => avgRV),
            borderColor: "#f472b6",
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false,
          },
          {
            label: `Media RF (${avgRF.toFixed(0)}%)`,
            data: months.map(() => avgRF),
            borderColor: "#60a5fa",
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false,
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
              label: (ctx) => ctx.dataset.label + ": " + (ctx.raw as number).toFixed(1) + "%",
            },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#64748b", callback: (v) => v + "%" },
            grid: { color: "#293548" },
          },
        },
      },
    };
  }, [state.port, months]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
