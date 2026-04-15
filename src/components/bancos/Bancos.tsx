import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";
import { BANK_COLORS } from "../../data/constants";

/** `getBankColor` from the original — substring match with a hash fallback. */
function getBankColor(b: string): string {
  for (const k of Object.keys(BANK_COLORS)) {
    if (b.toLowerCase().includes(k.toLowerCase())) return (BANK_COLORS as Record<string, string>)[k];
  }
  const hash = Array.from(b).reduce((a, c) => c.charCodeAt(0) + (a << 5) - a, 0);
  return `hsl(${Math.abs(hash) % 360},60%,50%)`;
}

/** Bancos tab — evolution stacked area + current donut + detail table. */
export function Bancos() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const stackConfig: ChartConfiguration = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const banks = Object.keys(d.banco_series).sort(
      (a, b) => (d.banco_series[b][lastM] || 0) - (d.banco_series[a][lastM] || 0)
    );
    return {
      type: "line",
      data: {
        labels: months,
        datasets: banks.map((b) => ({
          label: b,
          data: months.map((mi) => d.banco_series[b][mi] || 0),
          backgroundColor: getBankColor(b),
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
  }, [state.port, months]);

  const { donutConfig, rows, total } = useMemo(() => {
    const d = getEnriched(state.port);
    const lastM = months[months.length - 1];
    const banks = Object.keys(d.banco_series).sort(
      (a, b) => (d.banco_series[b][lastM] || 0) - (d.banco_series[a][lastM] || 0)
    );
    const donutBanks = banks.filter((b) => (d.banco_series[b][lastM] || 0) > 0);
    const cfg: ChartConfiguration = {
      type: "doughnut",
      data: {
        labels: donutBanks,
        datasets: [
          {
            data: donutBanks.map((b) => d.banco_series[b][lastM]),
            backgroundColor: donutBanks.map((b) => getBankColor(b)),
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
        },
      },
    };
    const tot = banks.reduce((s, b) => s + (d.banco_series[b][lastM] || 0), 0);
    const tableRows = banks
      .map((b) => {
        const vNow = d.banco_series[b][lastM] || 0;
        if (vNow <= 0) return null;
        const vFirst = d.banco_series[b][months[0]] || 0;
        return { b, vNow, vFirst, pct: tot > 0 ? (vNow / tot) * 100 : 0, change: vNow - vFirst };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);
    return { donutConfig: cfg, rows: tableRows, total: tot };
  }, [state.port, months]);

  const stackRef = useChart(stackConfig);
  const donutRef = useChart(donutConfig);

  return (
    <div id="bancos" className="tab-content active">
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Evolución del Patrimonio por Banco (€)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Patrimonio total depositado en cada entidad bancaria a lo largo del tiempo. Permite
            ver traspasos y concentración entre bancos.
          </p>
          <div style={{ height: 450 }}>
            <canvas ref={stackRef} />
          </div>
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-box">
          <h3>Distribución Actual por Banco</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Peso porcentual del patrimonio en cada banco en el último mes seleccionado.
          </p>
          <canvas ref={donutRef} />
        </div>
        <div className="chart-box">
          <h3>Detalle por Banco (mes actual)</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Tabla con el valor, peso y variación en cada banco a lo largo del periodo.
          </p>
          <div style={{ overflow: "auto", maxHeight: 400 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <Th align="left">Banco</Th>
                  <Th>Valor</Th>
                  <Th>% Cartera</Th>
                  <Th>Inicio</Th>
                  <Th>Variación</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.b}
                    style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.5)" }}
                  >
                    <td style={{ padding: "6px 8px", color: "#e2e8f0" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: getBankColor(r.b),
                          marginRight: 6,
                        }}
                      />
                      {r.b}
                    </td>
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
                      {fmt(r.vFirst)}
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "right",
                        color: r.change >= 0 ? "#34d399" : "#f87171",
                      }}
                    >
                      {(r.change >= 0 ? "+" : "") + fmt(r.change)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #334155", fontWeight: 700 }}>
                  <td style={{ padding: 8, color: "#e2e8f0" }}>TOTAL</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#e2e8f0" }}>{fmt(total)}</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#94a3b8" }}>100%</td>
                  <td />
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
