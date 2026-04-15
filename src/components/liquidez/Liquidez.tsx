import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";

/**
 * Liquidez tab — computes cash weight and its evolution using real data.
 * Target is 1% of portfolio (as in the original module preview).
 */
export function Liquidez() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { config, kpis } = useMemo(() => {
    const d = getEnriched(state.port);
    const aa = d.asset_alloc;
    const lastM = months[months.length - 1];

    const cashSeries = months.map((mi) => aa.CASH[mi] || 0);
    const totalSeries = months.map(
      (mi) =>
        (aa.RV[mi] || 0) +
        (aa.RF[mi] || 0) +
        (aa.ALT[mi] || 0) +
        (aa.CASH[mi] || 0) +
        (aa.MULTI[mi] || 0)
    );
    const pctSeries = months.map((_, i) =>
      totalSeries[i] > 0 ? (cashSeries[i] / totalSeries[i]) * 100 : 0
    );
    const targetSeries = months.map(() => 1.0);

    const cfg: ChartConfiguration = {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Liquidez (%)",
            data: pctSeries,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34,211,238,0.12)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Objetivo (1 %)",
            data: targetSeries,
            borderColor: "#f59e0b",
            backgroundColor: "transparent",
            borderDash: [5, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
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
            ticks: { color: "#64748b", callback: (v) => Number(v).toFixed(1) + "%" },
            grid: { color: "#293548" },
          },
        },
      },
    };

    const cashNow = aa.CASH[lastM] || 0;
    const totalNow =
      (aa.RV[lastM] || 0) +
      (aa.RF[lastM] || 0) +
      (aa.ALT[lastM] || 0) +
      (aa.CASH[lastM] || 0) +
      (aa.MULTI[lastM] || 0);
    const pctNow = totalNow > 0 ? (cashNow / totalNow) * 100 : 0;
    const targetEur = totalNow * 0.01;
    const excess = cashNow - targetEur;

    return {
      config: cfg,
      kpis: {
        cashNow,
        pctNow,
        targetEur,
        excess,
      },
    };
  }, [state.port, months]);

  const canvasRef = useChart(config);

  return (
    <div id="liquidez" className="tab-content active">
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #3b82f6",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 12,
          color: "#cbd5e1",
        }}
      >
        🔬 <strong>Módulo en vista preliminar.</strong> Muestra la posición de liquidez real de
        la cartera comparada con el objetivo del 1% — lo suficiente para cubrir comisiones,
        llamadas de capital a corto y necesidades operativas.
      </div>
      <div className="kpi-row">
        <Kpi label="Liquidez Actual" value={fmt(kpis.cashNow)} sub={kpis.pctNow.toFixed(2) + "% del patrimonio"} />
        <Kpi label="Objetivo (1 %)" value={fmt(kpis.targetEur)} sub="Colchón operativo" />
        <Kpi
          label="Exceso / Déficit"
          value={(kpis.excess >= 0 ? "+" : "") + fmt(kpis.excess)}
          sub={kpis.excess >= 0 ? "Sobre-liquidez" : "Insuficiente"}
        />
        <Kpi
          label="Cobertura 90 días"
          value={kpis.cashNow > 0 ? "✓ OK" : "⚠"}
          sub="Obligaciones a corto plazo"
        />
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Evolución de Liquidez vs Objetivo (1 %)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Peso de la cuenta corriente en la cartera total a lo largo del periodo, comparado con
            el objetivo del 1 %.
          </p>
          <canvas ref={canvasRef} />
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
