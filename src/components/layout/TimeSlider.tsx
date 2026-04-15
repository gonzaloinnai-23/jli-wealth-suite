import type React from "react";
import { useDashboard } from "../../context/DashboardContext";
import { ALL_MONTHS_FALLBACK } from "../../data/portfolio";

const rangeInputStyle = (zIndex: number): React.CSSProperties => ({
  position: "absolute",
  width: "100%",
  pointerEvents: "auto",
  WebkitAppearance: "none",
  appearance: "none",
  background: "transparent",
  height: 36,
  margin: 0,
  zIndex,
});

/**
 * Dual-handle range slider for the monthly period window.
 * Matches the original `timeSlider` widget but is now React-controlled.
 */
export function TimeSlider() {
  const { state, set, reset } = useDashboard();
  const months = ALL_MONTHS_FALLBACK; // replaced by real D.bca.months later
  const max = months.length - 1;
  const from = Math.min(state.rangeStart, max);
  const to = Math.min(state.rangeEnd, max);
  const leftPct = (from / max) * 100;
  const rightPct = (to / max) * 100;

  return (
    <div
      id="timeSlider"
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 10,
        padding: "14px 24px",
        margin: "0 auto 16px",
        maxWidth: 1200,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
        Periodo:
      </span>
      <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 700, minWidth: 50 }}>
        {months[from]}
      </span>
      <div style={{ flex: 1, position: "relative", height: 36, display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 6,
            background: "#1e293b",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            height: 6,
            background: "linear-gradient(90deg,#3b82f6,#f59e0b)",
            borderRadius: 3,
          }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={from}
          step={1}
          onChange={(e) => {
            const v = Math.min(+e.target.value, to - 1);
            set("rangeStart", v);
          }}
          style={rangeInputStyle(3)}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={to}
          step={1}
          onChange={(e) => {
            const v = Math.max(+e.target.value, from + 1);
            set("rangeEnd", v);
          }}
          style={rangeInputStyle(4)}
        />
      </div>
      <span
        style={{
          color: "#f59e0b",
          fontSize: 13,
          fontWeight: 700,
          minWidth: 50,
          textAlign: "right",
        }}
      >
        {months[to]}
      </span>
      <span style={{ color: "#64748b", fontSize: 11, whiteSpace: "nowrap" }}>
        ({to - from + 1} meses)
      </span>
      <button
        onClick={reset}
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          color: "#94a3b8",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 11,
          cursor: "pointer",
        }}
        title="Reset a periodo completo"
      >
        ↻
      </button>
    </div>
  );
}
