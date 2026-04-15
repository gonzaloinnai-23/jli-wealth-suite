import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { CHART_PALETTE } from "../../data/constants";

/**
 * Costes tab — TER evolution + annual cost + cost distribution donut +
 * detail table. The "impacto a largo plazo" compound-cost block with its
 * interactive sliders is deferred to Fase 7 if time allows.
 */
export function Costes() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { terChart, costChart, donutConfig, rows, kpis } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];

    // TER weighted average line (%)
    const terLine: ChartConfiguration = {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "TER medio ponderado",
            data: months.map((mi) => d.ter_avg_series[mi] || 0),
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            ticks: {
              color: "#64748b",
              callback: (v) => Number(v).toFixed(2) + "%",
            },
            grid: { color: "#293548" },
          },
        },
      },
    };

    // Annual cost (€) line
    const annualCostLine: ChartConfiguration = {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Coste anual estimado",
            data: months.map((mi) => d.ter_cost_series[mi] || 0),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "#1e293b" } },
          y: {
            ticks: { color: "#64748b", callback: (v) => fmt(v as number) },
            grid: { color: "#293548" },
          },
        },
      },
    };

    // Cost distribution donut: per-product annual cost contribution
    const productCosts = d.products
      .map((p) => {
        const v = (p.valor && p.valor[lastM]) || 0;
        const ter = d.product_ter.get(p.producto) || 0;
        return { name: p.producto, cost: (v * ter) / 100, ter, value: v };
      })
      .filter((r) => r.cost > 0)
      .sort((a, b) => b.cost - a.cost);

    const donut: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: productCosts.map((r) => r.name),
        datasets: [
          {
            data: productCosts.map((r) => r.cost),
            backgroundColor: productCosts.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.label + ": " + fmt(ctx.raw as number) + "/año",
            },
          },
        },
      },
    };

    // Detail table + KPIs
    const totalValue = productCosts.reduce((s, r) => s + r.value, 0);
    const totalCost = productCosts.reduce((s, r) => s + r.cost, 0);
    const weightedAvg = totalValue > 0 ? (totalCost / totalValue) * 100 : 0;

    return {
      terChart: terLine,
      costChart: annualCostLine,
      donutConfig: donut,
      rows: productCosts,
      kpis: {
        totalValue,
        totalCost,
        weightedAvg,
        nProducts: productCosts.length,
      },
    };
  }, [state.port, months]);

  const terRef = useChart(terChart);
  const costRef = useChart(costChart);
  const donutRef = useChart(donutConfig);

  return (
    <div id="costes" className="tab-content active">
      <div className="kpi-row">
        <Kpi label="Coste Anual Estimado" value={fmt(kpis.totalCost)} sub="TER actual × valor" />
        <Kpi
          label="TER Medio Ponderado"
          value={kpis.weightedAvg.toFixed(2) + "%"}
          sub="Sobre patrimonio total"
        />
        <Kpi label="Productos con Coste" value={String(kpis.nProducts)} sub="Fondos y carteras" />
        <Kpi label="Patrimonio Afectado" value={fmt(kpis.totalValue)} sub="Mes actual" />
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Evolución del TER Medio Ponderado (%)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            TER (Total Expense Ratio) medio ponderado por valor de cada producto. Refleja el
            coste anual implícito de la cartera — menor es mejor.
          </p>
          <canvas ref={terRef} />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-box">
          <h3>Coste Anual Estimado (€)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Coste en euros que pagas al año por las comisiones de gestión, basado en el TER × valor.
          </p>
          <canvas ref={costRef} />
        </div>
        <div className="chart-box">
          <h3>Distribución de Costes Actual</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Reparto del coste total entre los distintos productos — para identificar qué fondos
            pesan más en comisiones.
          </p>
          <canvas ref={donutRef} />
        </div>
      </div>
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Detalle de TER por Producto (mes actual)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Tabla completa con el TER, valor y coste estimado de cada producto individual.
          </p>
          <div style={{ overflow: "auto", maxHeight: 400 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <Th align="left">Producto</Th>
                  <Th>TER</Th>
                  <Th>Valor</Th>
                  <Th>Coste Anual</Th>
                  <Th>% Total</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.name}
                    style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.5)" }}
                  >
                    <td style={{ padding: "6px 8px", color: "#e2e8f0" }}>{r.name}</td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "right",
                        color: "#e2e8f0",
                      }}
                    >
                      {r.ter.toFixed(2)}%
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#94a3b8" }}>
                      {fmt(r.value)}
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "right",
                        color: "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(r.cost)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#94a3b8" }}>
                      {kpis.totalCost > 0 ? ((r.cost / kpis.totalCost) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #334155", fontWeight: 700 }}>
                  <td style={{ padding: 8, color: "#e2e8f0" }}>TOTAL</td>
                  <td
                    style={{ padding: 8, textAlign: "right", color: "#e2e8f0" }}
                  >{kpis.weightedAvg.toFixed(2)}%</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#e2e8f0" }}>
                    {fmt(kpis.totalValue)}
                  </td>
                  <td style={{ padding: 8, textAlign: "right", color: "#f87171" }}>
                    {fmt(kpis.totalCost)}
                  </td>
                  <td style={{ padding: 8, textAlign: "right", color: "#94a3b8" }}>100%</td>
                </tr>
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
