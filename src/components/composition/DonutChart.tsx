import { useMemo } from "react";
import type { ChartConfiguration, Plugin } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";

/**
 * Composición Actual — doughnut of the 4 asset classes computed from raw
 * product values at the last selected month. Fondo Multiactivo is split
 * 50/50 between RV and RF. Ported from the inline `donut` block.
 */
export function DonutChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { config, total } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const buckets: Record<"RV" | "RF" | "GOLD" | "ALT", number> = {
      RV: 0,
      RF: 0,
      GOLD: 0,
      ALT: 0,
    };
    d.products.forEach((p) => {
      const v = (p.valor && p.valor[lastM]) || 0;
      if (v <= 0) return;
      const t = p.tipologia || "";
      if (t === "Fondo Renta Variable" || t === "ETF Renta Variable" || t === "Cartera Gestionada RV") {
        buckets.RV += v;
      } else if (
        t === "Cartera Gestionada RF" ||
        t === "Fondo Renta Fija" ||
        t === "Renta Fija Directa" ||
        t === "Fondo Monetario" ||
        t === "Cuenta Corriente"
      ) {
        buckets.RF += v;
      } else if (t === "ETF Materias Primas") {
        buckets.GOLD += v;
      } else if (t === "Vehículo Alternativo") {
        if (/gold/i.test(p.producto || "")) buckets.GOLD += v;
        else buckets.ALT += v;
      } else if (t === "Fondo Multiactivo") {
        buckets.RV += v * 0.5;
        buckets.RF += v * 0.5;
      } else {
        buckets.RV += v;
      }
    });

    const labels = ["Renta Variable", "Renta Fija", "Oro / Mat. Primas", "Alternativos / PE"];
    const colors = ["#f472b6", "#60a5fa", "#fbbf24", "#f87171"];
    const values = [buckets.RV, buckets.RF, buckets.GOLD, buckets.ALT];
    const indices = values.map((_, i) => i).filter((i) => values[i] > 0);
    const tot = indices.reduce((s, i) => s + values[i], 0);

    const donutLabelPlugin: Plugin<"doughnut"> = {
      id: "donutLabels",
      afterDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        (chart.data.datasets[0].data as number[]).forEach((val, i) => {
          const arc = meta.data[i];
          if (!arc) return;
          const pct = (val / tot) * 100;
          if (pct < 3) return;
          const { x, y } = arc.tooltipPosition(true);
          ctx.save();
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText(pct.toFixed(1) + "%", x, y - 6);
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText(fmt(val), x, y + 8);
          ctx.restore();
        });
      },
    };

    const cfg: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: indices.map((i) => labels[i]),
        datasets: [
          {
            data: indices.map((i) => values[i]),
            backgroundColor: indices.map((i) => colors[i]),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "right",
            labels: { color: "#94a3b8", boxWidth: 10, font: { size: 10 }, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw as number;
                return ctx.label + ": " + fmt(v) + " (" + ((v / tot) * 100).toFixed(1) + "%)";
              },
            },
          },
        },
      },
      plugins: [donutLabelPlugin],
    };
    return { config: cfg, total: tot };
  }, [state.port, months]);

  const canvasRef = useChart(config);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  total;
  return <canvas ref={canvasRef} />;
}
