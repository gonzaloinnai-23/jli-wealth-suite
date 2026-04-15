import { useMemo } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { getEnriched } from "../../lib/calc";
import { fmt } from "../../lib/format";

// Target allocation (illustrative for the demo)
const TARGETS: Record<"RV" | "RF" | "ALT" | "CASH" | "MULTI", number> = {
  RV: 35,
  RF: 30,
  ALT: 25,
  CASH: 2,
  MULTI: 8,
};

const LABELS: Record<keyof typeof TARGETS, string> = {
  RV: "Renta Variable",
  RF: "Renta Fija",
  ALT: "Alternativos",
  CASH: "Liquidez",
  MULTI: "Multiactivo",
};

/** Rebalanceo tab — current vs target allocation drift per class. */
export function Rebalanceo() {
  const { state } = useDashboard();
  const months = useFilteredMonths();

  const rows = useMemo(() => {
    const d = getEnriched(state.port);
    const aa = d.asset_alloc;
    const lastM = months[months.length - 1];
    const total =
      (aa.RV[lastM] || 0) +
      (aa.RF[lastM] || 0) +
      (aa.ALT[lastM] || 0) +
      (aa.CASH[lastM] || 0) +
      (aa.MULTI[lastM] || 0);
    return (Object.keys(TARGETS) as (keyof typeof TARGETS)[]).map((k) => {
      const v = aa[k][lastM] || 0;
      const pct = total > 0 ? (v / total) * 100 : 0;
      const target = TARGETS[k];
      const drift = pct - target;
      const driftEur = (drift / 100) * total;
      return { k, label: LABELS[k], v, pct, target, drift, driftEur };
    });
  }, [state.port, months]);

  return (
    <div id="rebalanceo" className="tab-content active">
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
        ⚖️ <strong>Desviaciones respecto al objetivo.</strong> Los objetivos son ilustrativos
        del plan de inversión familiar. Drift positivo = por encima del objetivo; negativo =
        por debajo.
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Asignación Actual vs Objetivo</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Peso actual de cada clase comparado con su objetivo, y cuánto habría que mover para
            rebalancear.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <Th align="left">Clase</Th>
                <Th>Valor</Th>
                <Th>Actual %</Th>
                <Th>Objetivo %</Th>
                <Th>Drift (pp)</Th>
                <Th>Drift (€)</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.k}
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.4)" }}
                >
                  <td style={{ padding: "8px", color: "#e2e8f0", fontWeight: 600 }}>{r.label}</td>
                  <td style={{ padding: "8px", textAlign: "right", color: "#94a3b8" }}>
                    {fmt(r.v)}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#e2e8f0",
                      fontWeight: 600,
                    }}
                  >
                    {r.pct.toFixed(1)}%
                  </td>
                  <td style={{ padding: "8px", textAlign: "right", color: "#94a3b8" }}>
                    {r.target.toFixed(1)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color:
                        Math.abs(r.drift) < 2
                          ? "#34d399"
                          : Math.abs(r.drift) < 5
                          ? "#fbbf24"
                          : "#f87171",
                      fontWeight: 700,
                    }}
                  >
                    {(r.drift >= 0 ? "+" : "") + r.drift.toFixed(1)} pp
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: r.driftEur >= 0 ? "#34d399" : "#f87171",
                      fontWeight: 600,
                    }}
                  >
                    {(r.driftEur >= 0 ? "+" : "") + fmt(r.driftEur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
