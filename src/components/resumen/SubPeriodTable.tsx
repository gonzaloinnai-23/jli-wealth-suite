import { useMemo } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import {
  buildSubPeriods,
  benchSlice,
  inflSlice,
  twrRealSlice,
  twrSlice,
} from "../../lib/calc";
import { fmtPct } from "../../lib/format";

interface Row {
  label: string;
  count: number | null;
  tw: number | null;
  infl: number | null;
  twReal: number | null;
  bench: number | null;
  gap: number | null;
}

/**
 * TWR por Sub-Periodos — 5 rows (Últ. 3m / 6m / 12m / YTD / selected).
 * Mirrors the table rendered by `renderResumen` at `#subPeriodTable`.
 */
export function SubPeriodTable() {
  const { state } = useDashboard();
  const selected = useFilteredMonths();

  const rows: Row[] = useMemo(() => {
    const periods = buildSubPeriods(state.port, selected);
    return periods.map((p) => {
      if (!p.months)
        return { label: p.label, count: null, tw: null, infl: null, twReal: null, bench: null, gap: null };
      const tw = twrSlice(state.port, p.months);
      const bench = benchSlice(state.port, p.months);
      const infl = inflSlice(p.months);
      const twReal = twrRealSlice(state.port, p.months);
      const gap = tw != null && bench != null ? Math.round((tw - bench) * 100) : null;
      return { label: p.label, count: p.months.length, tw, infl, twReal, bench, gap };
    });
  }, [state.port, selected]);

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <Th color="#94a3b8" align="left">
              Periodo
            </Th>
            <Th color="#94a3b8">Meses</Th>
            <Th color="#3b82f6">TWR Nominal</Th>
            <Th color="#f87171">Inflación</Th>
            <Th color="#34d399">TWR Real</Th>
            <Th color="#a78bfa">Benchmark</Th>
            <Th color="#94a3b8">Gap (bps)</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ padding: "6px 10px", color: "#e2e8f0", fontWeight: 600 }}>{r.label}</td>
              {r.count == null ? (
                <td
                  colSpan={6}
                  style={{ padding: "6px", textAlign: "center", color: "#334155" }}
                >
                  —
                </td>
              ) : (
                <>
                  <td style={{ padding: "6px", textAlign: "center", color: "#64748b" }}>
                    {r.count}
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: (r.tw ?? 0) >= 0 ? "#34d399" : "#f87171",
                    }}
                  >
                    {r.tw != null ? fmtPct(r.tw) : "—"}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", color: "#f87171" }}>
                    {r.infl != null ? fmtPct(r.infl) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: (r.twReal ?? 0) >= 0 ? "#34d399" : "#f87171",
                    }}
                  >
                    {r.twReal != null ? fmtPct(r.twReal) : "—"}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", color: "#94a3b8" }}>
                    {r.bench != null ? fmtPct(r.bench) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: r.gap == null ? "#64748b" : r.gap >= 0 ? "#34d399" : "#f87171",
                    }}
                  >
                    {r.gap != null ? (r.gap >= 0 ? "+" : "") + r.gap + " bps" : "—"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: "#64748b", fontSize: 10, marginTop: 6 }}>
        TWR Real = TWR nominal ajustado por IPC España (fuente: INE). Benchmark = réplica
        ponderada por tu asset allocation.
      </p>
    </>
  );
}

function Th({
  children,
  color,
  align = "center",
}: {
  children: React.ReactNode;
  color: string;
  align?: "left" | "center";
}) {
  return (
    <th
      style={{
        padding: align === "left" ? "8px 10px" : "8px 6px",
        color,
        borderBottom: "1px solid #334155",
        textAlign: align,
      }}
    >
      {children}
    </th>
  );
}
