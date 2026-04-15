import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { TIT_COLORS } from "../../data/constants";

/** Titulares tab — per-owner KPIs, stacked area, donut and detail table. */
export function Titulares() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const { kpis, donutCfg, evoCfg, rows, totalNow, totalProds } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const tits = Object.keys(d.titular_series).sort(
      (a, b) => (d.titular_series[b][lastM] || 0) - (d.titular_series[a][lastM] || 0)
    );
    const tot = tits.reduce((s, t) => s + (d.titular_series[t][lastM] || 0), 0);

    const kpiItems = tits
      .filter((t) => (d.titular_series[t][lastM] || 0) !== 0)
      .map((t) => {
        const v = d.titular_series[t][lastM] || 0;
        const pct = tot > 0 ? (v / tot) * 100 : 0;
        return {
          label: "Titular: " + t,
          value: fmt(v),
          sub: pct.toFixed(1) + "% del total",
          cls: v >= 0 ? "" : "neg",
        } as const;
      });

    const donutTits = tits.filter((t) => (d.titular_series[t][lastM] || 0) > 0);
    const donut: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: donutTits,
        datasets: [
          {
            data: donutTits.map((t) => d.titular_series[t][lastM]),
            backgroundColor: donutTits.map(
              (_, i) => TIT_COLORS[i % TIT_COLORS.length]
            ),
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
            labels: { color: "#94a3b8", boxWidth: 10, font: { size: 11 }, padding: 8 },
          },
        },
      },
    };

    const activeTits = tits.filter((t) => months.some((mi) => (d.titular_series[t][mi] || 0) > 0));
    const evo: ChartConfiguration = {
      type: "line",
      data: {
        labels: months,
        datasets: activeTits.map((t, i) => ({
          label: t,
          data: months.map((mi) => d.titular_series[t][mi] || 0),
          backgroundColor: TIT_COLORS[i % TIT_COLORS.length],
          borderColor: "transparent",
          fill: true,
          pointRadius: 0,
        })),
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
            stacked: true,
            ticks: { color: "#64748b", callback: (v) => fmt(v as number) },
            grid: { color: "#293548" },
          },
        },
      },
    };

    const tableRows = tits
      .map((t, i) => {
        const vNow = d.titular_series[t][lastM] || 0;
        if (vNow === 0) return null;
        const pct = tot > 0 ? (vNow / tot) * 100 : 0;
        const prods = d.products.filter(
          (p) => p.titular === t && (p.valor[lastM] || 0) !== 0
        );
        const tipos = Array.from(new Set(prods.map((p) => p.tipologia))).join(", ");
        return {
          t,
          vNow,
          pct,
          nProds: prods.length,
          tipos,
          color: TIT_COLORS[i % TIT_COLORS.length],
        };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);

    const totP = d.products.filter((p) => (p.valor[lastM] || 0) !== 0).length;

    return {
      kpis: kpiItems,
      donutCfg: donut,
      evoCfg: evo,
      rows: tableRows,
      totalNow: tot,
      totalProds: totP,
    };
  }, [state.port, months]);

  const donutRef = useChart(donutCfg);
  const evoRef = useChart(evoCfg);

  return (
    <div id="titulares" className="tab-content active">
      <div className="kpi-row">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value ${k.cls}`} style={{ fontSize: "1.4rem" }}>
              {k.value}
            </div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="chart-row">
        <div className="chart-box">
          <h3>Distribución por Titular</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Peso actual del patrimonio por titular (mes seleccionado).
          </p>
          <canvas ref={donutRef} />
        </div>
        <div className="chart-box">
          <h3>Evolución por Titular (€)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Evolución del patrimonio acumulado por cada titular a lo largo del periodo.
          </p>
          <canvas ref={evoRef} />
        </div>
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Detalle por Titular</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Valor actual, % de cartera, número de productos y tipologías por titular.
          </p>
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <Th align="left">Titular</Th>
                  <Th>Valor</Th>
                  <Th>% Cartera</Th>
                  <Th>Nº Productos</Th>
                  <Th align="left">Tipologías</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.t}
                    style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.5)" }}
                  >
                    <td style={{ padding: "6px 8px", color: r.color, fontWeight: 600 }}>{r.t}</td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "right",
                        color: "#e2e8f0",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(r.vNow)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#94a3b8" }}>
                      {r.pct.toFixed(1)}%
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#94a3b8" }}>
                      {r.nProds}
                    </td>
                    <td style={{ padding: "6px 8px", color: "#94a3b8", fontSize: 11 }}>
                      {r.tipos}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #334155", fontWeight: 700 }}>
                  <td style={{ padding: 8, color: "#e2e8f0" }}>TOTAL</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#e2e8f0" }}>
                    {fmt(totalNow)}
                  </td>
                  <td style={{ padding: 8, textAlign: "right", color: "#94a3b8" }}>100%</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#94a3b8" }}>{totalProds}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
