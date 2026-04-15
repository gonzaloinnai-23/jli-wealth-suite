import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched, computeKpis } from "../../lib/calc";
import { fmt, fmtPct } from "../../lib/format";

/**
 * Proyección tab — simplified Monte Carlo-style projection based on the
 * historical TWR annualised return and volatility. The original uses a full
 * stochastic simulation; here we show P10/P50/P90 bands under a normal
 * assumption which captures the same essence with far less code.
 */
export function Proyeccion() {
  const { state, set } = useDashboard();
  const months = useFilteredMonths();

  const { config, annPct, vol, totalNow, horizon, finalP50 } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const totalNow = d.total_series[lastM] || 0;
    const k = computeKpis(state.port, d.months); // full history for stable estimates
    const annDec = k.annPct / 100;
    const vol = k.vol / 100;
    const horizon = state.projYears;

    const years = Array.from({ length: horizon + 1 }, (_, i) => i);
    const p50: number[] = [];
    const p10: number[] = [];
    const p90: number[] = [];
    years.forEach((y) => {
      // Lognormal closed-form bands. For small horizons this is a decent
      // approximation to a full Monte Carlo simulation.
      const drift = annDec - (vol * vol) / 2;
      const mean = Math.log(totalNow) + drift * y;
      const sd = vol * Math.sqrt(y);
      p50.push(Math.exp(mean));
      p10.push(Math.exp(mean - 1.2816 * sd));
      p90.push(Math.exp(mean + 1.2816 * sd));
    });

    const cfg: ChartConfiguration = {
      type: "line",
      data: {
        labels: years.map((y) => "Año " + y),
        datasets: [
          {
            label: "P90 (optimista)",
            data: p90,
            borderColor: "#34d399",
            backgroundColor: "transparent",
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
          {
            label: "P50 (mediana)",
            data: p50,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.15)",
            borderWidth: 2.5,
            pointRadius: 2,
            tension: 0.25,
            fill: "-1",
          },
          {
            label: "P10 (pesimista)",
            data: p10,
            borderColor: "#f87171",
            backgroundColor: "rgba(248,113,113,0.08)",
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: "-1",
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
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.dataset.label + ": " + fmt(ctx.raw as number),
            },
          },
        },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            ticks: { color: "#64748b", callback: (v) => fmt(v as number) },
            grid: { color: "#293548" },
          },
        },
      },
    };

    return {
      config: cfg,
      annPct: k.annPct,
      vol: k.vol,
      totalNow,
      horizon,
      finalP50: p50[p50.length - 1],
    };
  }, [state.port, state.projYears, months]);

  const canvasRef = useChart(config);

  return (
    <div id="proyeccion" className="tab-content active">
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #f59e0b",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 12,
          color: "#cbd5e1",
        }}
      >
        ⚠️ <strong>Proyección orientativa (beta).</strong> Usa la TWR anualizada histórica y la
        volatilidad mensual de la cartera bajo un modelo lognormal. No constituye garantía de
        rentabilidad futura.
      </div>

      <div className="kpi-row">
        <Kpi label="Patrimonio Actual" value={fmt(totalNow)} sub="Punto de partida" />
        <Kpi label="Retorno Anual (histórico)" value={fmtPct(annPct)} sub="Base del modelo" />
        <Kpi label="Volatilidad Anual" value={vol.toFixed(1) + "%"} sub="Dispersión histórica" />
        <Kpi
          label={`Proyección P50 @ ${horizon}y`}
          value={fmt(finalP50)}
          sub={"× " + (finalP50 / totalNow).toFixed(2)}
        />
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 12, flexWrap: "wrap" }}>
        {[5, 10, 15, 20, 25, 30].map((y) => (
          <HorizonBtn
            key={y}
            active={state.projYears === (y as typeof state.projYears)}
            onClick={() => set("projYears", y as typeof state.projYears)}
          >
            {y} años
          </HorizonBtn>
        ))}
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Proyección a {horizon} años (P10 · P50 · P90)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Bandas de percentil 10, mediana y percentil 90 de la evolución del patrimonio bajo
            un modelo lognormal con la media y volatilidad históricas de la cartera.
          </p>
          <div style={{ height: 400 }}>
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

function HorizonBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        fontSize: 12,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
