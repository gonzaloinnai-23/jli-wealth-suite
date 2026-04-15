import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { EVO_CLASSES, buildClassSeries } from "./evolucion-helpers";

/**
 * Stacked area of portfolio value broken down by asset class. Has two modes:
 *   - "real": actual € values (affected by contributions + returns)
 *   - "twr":  proportional to real composition but total follows pure TWR
 */
export function EvoStackChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const config: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const twr = d.twr_series;
    const { active, series } = buildClassSeries(state.port, months);

    const rawTotal0 = active.reduce((s, cn) => s + (series[cn][0] || 0), 0);
    const stackData: Record<string, number[]> = {};

    if (state.evoStackMode === "twr") {
      const twrTotals: number[] = [rawTotal0];
      for (let i = 1; i < months.length; i++) {
        twrTotals.push(twrTotals[i - 1] * (1 + (twr[months[i]] || 0) / 100));
      }
      active.forEach((cn) => {
        stackData[cn] = months.map((_, idx) => {
          const realTotal = active.reduce((s, c) => s + (series[c][idx] || 0), 0);
          const w = realTotal > 0 ? series[cn][idx] / realTotal : 0;
          return w * twrTotals[idx];
        });
      });
    } else {
      active.forEach((cn) => (stackData[cn] = series[cn]));
    }

    return {
      type: "line",
      data: {
        labels: months,
        datasets: active.map((cn) => ({
          label: cn,
          data: stackData[cn],
          backgroundColor: EVO_CLASSES[cn].color,
          borderColor: "transparent",
          fill: true,
          pointRadius: 0,
        })),
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
                const total = ctx.chart.data.datasets.reduce(
                  (s, ds) => s + ((ds.data[ctx.dataIndex] as number) || 0),
                  0
                );
                const v = ctx.raw as number;
                const pct = total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "0%";
                return ctx.dataset.label + ": " + fmt(v) + " (" + pct + ")";
              },
              footer: (items) => {
                const total = items.reduce((s, it) => s + ((it.raw as number) || 0), 0);
                return "Total: " + fmt(total);
              },
            },
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
  }, [state.port, months, state.evoStackMode]);

  const canvasRef = useChart(config);
  return <canvas ref={canvasRef} />;
}
