import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";

/**
 * Diversificación tab — HHI concentration + top-N holdings.
 * Simple measure: Herfindahl index on current product weights.
 */
export function Diversificacion() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { topConfig, hhi, effective, topRows, totalNow } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const prods = d.products
      .map((p) => ({
        producto: p.producto,
        banco: p.banco,
        tipologia: p.tipologia,
        value: p.valor[lastM] || 0,
      }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
    const tot = prods.reduce((s, r) => s + r.value, 0);
    const weights = prods.map((r) => r.value / tot);
    const h = weights.reduce((s, w) => s + w * w, 0);
    const eff = h > 0 ? 1 / h : 0;

    const top = prods.slice(0, 10);
    const cfg: ChartConfiguration = {
      type: "bar",
      data: {
        labels: top.map((r) => {
          const n = r.producto;
          return n.length > 30 ? n.slice(0, 28) + "…" : n;
        }),
        datasets: [
          {
            data: top.map((r) => (r.value / tot) * 100),
            backgroundColor: "#a78bfa",
            borderWidth: 0,
            barThickness: 20,
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
              label: (ctx) => (ctx.raw as number).toFixed(2) + "% de la cartera",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#64748b", callback: (v) => Number(v).toFixed(0) + "%" },
            grid: { color: "#1e293b" },
          },
          y: { ticks: { color: "#e2e8f0", font: { size: 10 } }, grid: { display: false } },
        },
      },
    };

    return { topConfig: cfg, hhi: h, effective: eff, topRows: top, totalNow: tot };
  }, [state.port, months]);

  const canvasRef = useChart(topConfig);

  return (
    <div id="diversificacion" className="tab-content active">
      <div className="kpi-row">
        <Kpi
          label="HHI (concentración)"
          value={(hhi * 10000).toFixed(0)}
          sub="< 1500 = poco concentrado"
        />
        <Kpi
          label="Número Efectivo de Fondos"
          value={effective.toFixed(1)}
          sub="1 / HHI — diversificación real"
        />
        <Kpi label="Productos Activos" value={String(topRows.length > 10 ? "10+" : topRows.length)} sub="Posiciones > 0" />
        <Kpi label="Patrimonio Total" value={fmt(totalNow)} sub="Mes actual" />
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Top 10 Productos por Peso</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Las 10 posiciones más grandes de la cartera, ordenadas por porcentaje del patrimonio.
          </p>
          <div style={{ height: 320 }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: "1.4rem" }}>
        {value}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
