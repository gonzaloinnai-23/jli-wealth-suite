import { useMemo, useState } from "react";
import { useSnapshot } from "../../data/store";

/**
 * Read-only preview of the market constants bundled with the dataset:
 * EUR/USD, CPI España, MSCI World, IG Bond EUR, IG Bond USD, Gold, EM,
 * 60/40, plus the per-ISIN USD and TER lookup tables.
 *
 * Marked as read-only in this iteration — editing these would require
 * refactoring every calc helper to read from the store instead of the
 * static imports. Planned for a follow-up (Fase 9).
 */
const SERIES_LABELS: Record<string, string> = {
  EURUSD: "EUR/USD",
  CPI_ES: "IPC España (%)",
  MSCI: "MSCI World (%)",
  BOND: "IG Bond EUR (%)",
  BOND_USD: "IG Bond USD (%)",
  GOLD: "Gold (%)",
  EM: "MSCI EM (%)",
  "6040": "60/40 Blend (%)",
};

export function ConstantsViewer() {
  const snapshot = useSnapshot();
  const [activeTab, setActiveTab] = useState<"series" | "isin">("series");
  const [selectedSeries, setSelectedSeries] = useState<string>("EURUSD");

  const seriesMap = useMemo(() => {
    return {
      EURUSD: snapshot.constants.EURUSD,
      CPI_ES: snapshot.constants.CPI_ES,
      MSCI: snapshot.constants.BENCH.MSCI,
      BOND: snapshot.constants.BENCH.BOND,
      BOND_USD: snapshot.constants.BENCH.BOND_USD,
      GOLD: snapshot.constants.BENCH.GOLD,
      EM: snapshot.constants.BENCH.EM,
      "6040": snapshot.constants.BENCH["6040"],
    } as Record<string, Record<string, number>>;
  }, [snapshot]);

  const series = seriesMap[selectedSeries] || {};
  const months = Object.keys(series);

  return (
    <div className="chart-box" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Constantes del mercado</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
            🔒 Solo lectura · Series macro, tipos de cambio y lookups por ISIN
          </p>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          <TabBtn active={activeTab === "series"} onClick={() => setActiveTab("series")} pos="left">
            Series mensuales
          </TabBtn>
          <TabBtn active={activeTab === "isin"} onClick={() => setActiveTab("isin")} pos="right">
            Lookups por ISIN
          </TabBtn>
        </div>
      </div>

      {activeTab === "series" ? (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.keys(SERIES_LABELS).map((k) => (
              <button
                key={k}
                onClick={() => setSelectedSeries(k)}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  border: "1px solid #334155",
                  background: selectedSeries === k ? "#3b82f6" : "#1e293b",
                  color: selectedSeries === k ? "#fff" : "#94a3b8",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {SERIES_LABELS[k]}
              </button>
            ))}
          </div>
          <div style={{ overflow: "auto", maxHeight: 360 }}>
            <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "#0f172a" }}>
                  <th style={cellHead}>Mes</th>
                  <th style={{ ...cellHead, textAlign: "right" }}>
                    {SERIES_LABELS[selectedSeries]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {months.map((m, i) => (
                  <tr
                    key={m}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)",
                    }}
                  >
                    <td style={{ padding: "3px 8px", color: "#94a3b8" }}>{m}</td>
                    <td
                      style={{
                        padding: "3px 8px",
                        textAlign: "right",
                        color: "#e2e8f0",
                        fontFamily: "ui-monospace, monospace",
                      }}
                    >
                      {series[m]?.toFixed?.(4) ?? series[m]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <IsinLookups
          usd={snapshot.constants.USD_COEFF}
          ter={snapshot.constants.TER_ISIN}
          dep={snapshot.constants.DEP_BANK}
        />
      )}
    </div>
  );
}

function IsinLookups({
  usd,
  ter,
  dep,
}: {
  usd: Record<string, number>;
  ter: Record<string, number>;
  dep: Record<string, number>;
}) {
  const isins = Array.from(new Set([...Object.keys(usd), ...Object.keys(ter)])).sort();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div>
        <h4 style={{ margin: "0 0 6px 0", color: "#e2e8f0", fontSize: 12 }}>
          Coeficiente USD y TER por ISIN
        </h4>
        <div style={{ overflow: "auto", maxHeight: 320 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
            <thead>
              <tr style={{ position: "sticky", top: 0, background: "#0f172a" }}>
                <th style={cellHead}>ISIN</th>
                <th style={{ ...cellHead, textAlign: "right" }}>% USD</th>
                <th style={{ ...cellHead, textAlign: "right" }}>TER (%)</th>
              </tr>
            </thead>
            <tbody>
              {isins.map((isin, i) => (
                <tr
                  key={isin}
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)" }}
                >
                  <td style={{ padding: "3px 8px", color: "#cbd5e1", fontFamily: "ui-monospace, monospace" }}>
                    {isin}
                  </td>
                  <td
                    style={{
                      padding: "3px 8px",
                      textAlign: "right",
                      color: "#e2e8f0",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {usd[isin] != null ? (usd[isin] * 100).toFixed(0) + "%" : "—"}
                  </td>
                  <td
                    style={{
                      padding: "3px 8px",
                      textAlign: "right",
                      color: "#e2e8f0",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {ter[isin] != null ? ter[isin].toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 style={{ margin: "0 0 6px 0", color: "#e2e8f0", fontSize: 12 }}>
          Depositaría por banco
        </h4>
        <div style={{ overflow: "auto", maxHeight: 320 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
            <thead>
              <tr style={{ position: "sticky", top: 0, background: "#0f172a" }}>
                <th style={cellHead}>Banco</th>
                <th style={{ ...cellHead, textAlign: "right" }}>Custodia (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dep).map(([b, v], i) => (
                <tr
                  key={b}
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)" }}
                >
                  <td style={{ padding: "3px 8px", color: "#cbd5e1" }}>{b}</td>
                  <td
                    style={{
                      padding: "3px 8px",
                      textAlign: "right",
                      color: "#e2e8f0",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {v.toFixed(2)}
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

const cellHead: React.CSSProperties = {
  padding: "6px 8px",
  color: "#94a3b8",
  textAlign: "left",
  borderBottom: "1px solid #334155",
  fontSize: 10,
  fontWeight: 600,
};

function TabBtn({
  active,
  onClick,
  children,
  pos,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  pos: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        fontSize: 11,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        borderRadius: pos === "left" ? "4px 0 0 4px" : "0 4px 4px 0",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
