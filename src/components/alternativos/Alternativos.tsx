import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useChart } from "../../hooks/useChart";
import { fmt } from "../../lib/format";
import {
  ALT_DATA,
  ALT_TYPE_COLORS,
  ALT_TYPE_LABELS,
  ALT_TARGETS,
  ALT_INFO,
  ALT_PHASE_COLORS,
  ALT_PHASE_LABELS,
} from "../../data/constants";

/**
 * Alternativos tab — vehicle list (private equity / RE / infra / credit /
 * VC), distribution by type vs target, fact sheets pulled from ALT_INFO.
 */
interface Fund {
  name: string;
  type: keyof typeof ALT_TYPE_LABELS;
  vintage: number;
  committed: number;
}

export function Alternativos() {
  const { state } = useDashboard();

  const { funds, distribConfig, vintageConfig, totalCommitted } = useMemo(() => {
    const funds: Fund[] = (ALT_DATA as any)[state.port] || (ALT_DATA as any).bca || [];
    const byType: Record<string, number> = {};
    funds.forEach((f) => {
      byType[f.type] = (byType[f.type] || 0) + f.committed;
    });
    const totalCommitted = funds.reduce((s, f) => s + f.committed, 0);

    const typeKeys = Object.keys(ALT_TYPE_LABELS) as (keyof typeof ALT_TYPE_LABELS)[];
    const actualPct = typeKeys.map((k) =>
      totalCommitted > 0 ? ((byType[k] || 0) / totalCommitted) * 100 : 0
    );
    const targetPct = typeKeys.map((k) => (ALT_TARGETS as any)[k] || 0);

    const distrib: ChartConfiguration = {
      type: "bar",
      data: {
        labels: typeKeys.map((k) => (ALT_TYPE_LABELS as any)[k]),
        datasets: [
          {
            label: "Actual",
            data: actualPct,
            backgroundColor: typeKeys.map((k) => (ALT_TYPE_COLORS as any)[k]),
            borderWidth: 0,
            barThickness: 22,
            borderRadius: 3,
          },
          {
            label: "Objetivo",
            data: targetPct,
            backgroundColor: "rgba(148,163,184,0.35)",
            borderWidth: 0,
            barThickness: 22,
            borderRadius: 3,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", boxWidth: 12, font: { size: 10 }, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ctx.dataset.label + ": " + (ctx.raw as number).toFixed(1) + "%",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#64748b", callback: (v) => Number(v).toFixed(0) + "%" },
            grid: { color: "#1e293b" },
          },
          y: {
            ticks: { color: "#e2e8f0", font: { size: 11, weight: "bold" } },
            grid: { display: false },
          },
        },
      },
    };

    // Concentration by vintage
    const byVintage: Record<number, number> = {};
    funds.forEach((f) => {
      byVintage[f.vintage] = (byVintage[f.vintage] || 0) + f.committed;
    });
    const vintages = Object.keys(byVintage)
      .map(Number)
      .sort((a, b) => a - b);
    const vintageChart: ChartConfiguration = {
      type: "bar",
      data: {
        labels: vintages.map(String),
        datasets: [
          {
            label: "Compromiso (€)",
            data: vintages.map((v) => byVintage[v]),
            backgroundColor: "#a78bfa",
            borderWidth: 0,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => "Compromiso: " + fmt(ctx.raw as number),
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

    return { funds, distribConfig: distrib, vintageConfig: vintageChart, totalCommitted };
  }, [state.port]);

  const distribRef = useChart(distribConfig);
  const vintageRef = useChart(vintageConfig);

  return (
    <div id="alternativos" className="tab-content active">
      <div className="kpi-row">
        <Kpi label="Compromiso Total" value={fmt(totalCommitted)} sub={`${funds.length} vehículos`} />
        <Kpi
          label="Tipos"
          value={String(new Set(funds.map((f) => f.type)).size)}
          sub="VC / Buyout / Credit / Infra / RE"
        />
        <Kpi
          label="Añada Más Reciente"
          value={String(Math.max(...funds.map((f) => f.vintage)))}
          sub="Último vintage comprometido"
        />
        <Kpi
          label="Horizonte Medio"
          value="~10 años"
          sub="Fondos cerrados estándar"
        />
      </div>

      <div className="chart-row">
        <div className="chart-box">
          <h3>Asignación Actual vs Objetivo (%)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Desvío entre el peso actual de cada tipo de alternativo y la asignación objetivo del
            plan familiar.
          </p>
          <div style={{ height: 220 }}>
            <canvas ref={distribRef} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Distribución por Añada (€)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Concentración del compromiso por año de cierre del fondo.
          </p>
          <div style={{ height: 220 }}>
            <canvas ref={vintageRef} />
          </div>
        </div>
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Detalle de Inversiones</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Cada fondo con su tipo, añada, fase del ciclo y compromiso.
          </p>
          <div style={{ overflow: "auto", maxHeight: 500 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <Th align="left">Fondo</Th>
                  <Th align="left">Tipo</Th>
                  <Th>Añada</Th>
                  <Th>Compromiso</Th>
                  <Th align="left">Fase</Th>
                  <Th align="left">Descripción</Th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f, i) => {
                  const info = (ALT_INFO as any)[f.name];
                  const phase = info?.phase || "inversion";
                  return (
                    <tr
                      key={f.name}
                      style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.4)" }}
                    >
                      <td style={{ padding: "6px 8px", color: "#e2e8f0", fontWeight: 600 }}>
                        {f.name}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: ((ALT_TYPE_COLORS as any)[f.type] || "#475569") + "33",
                            color: (ALT_TYPE_COLORS as any)[f.type] || "#e2e8f0",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {(ALT_TYPE_LABELS as any)[f.type] || f.type}
                        </span>
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: "#94a3b8" }}>
                        {f.vintage}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          textAlign: "right",
                          color: "#e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(f.committed)}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "1px 6px",
                            borderRadius: 3,
                            background: ((ALT_PHASE_COLORS as any)[phase] || "#475569") + "22",
                            color: (ALT_PHASE_COLORS as any)[phase] || "#94a3b8",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {(ALT_PHASE_LABELS as any)[phase] || phase}
                        </span>
                      </td>
                      <td style={{ padding: "6px 8px", color: "#94a3b8", fontSize: 11 }}>
                        {info?.category || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: 8,
        color: "#94a3b8",
        borderBottom: "1px solid #334155",
      }}
    >
      {children}
    </th>
  );
}
