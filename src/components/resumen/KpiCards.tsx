import { useMemo } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { computeKpis } from "../../lib/calc";
import { fmt, fmtPct } from "../../lib/format";

/** 5 + 4 KPI cards at the top of the Resumen tab, driven by real data. */
export function KpiCards() {
  const { state } = useDashboard();
  const months = useFilteredMonths();
  const k = useMemo(() => computeKpis(state.port, months), [state.port, months]);

  const row1 = [
    { l: "Cartera Actual", v: fmt(k.totalNow), s: k.lastMonth, cls: "" as const },
    {
      l: "TWR Nominal",
      v: fmtPct(k.returnPct),
      s: fmtPct(k.annPct) + " anualizado",
      cls: (k.returnPct >= 0 ? "pos" : "neg") as "pos" | "neg",
    },
    {
      l: "TWR Real (- Inflación)",
      v: fmtPct(k.realRetPct),
      s: "Inflación acum: " + fmtPct(k.inflPct) + " · Real anual: " + fmtPct(k.annReal),
      cls: (k.realRetPct >= 0 ? "pos" : "neg") as "pos" | "neg",
    },
    {
      l: "Benchmark Replicado",
      v: fmtPct(k.benchPct),
      s: "Ponderado por tu exposición real",
      cls: (k.benchPct >= 0 ? "pos" : "neg") as "pos" | "neg",
    },
    {
      l: "Implementation Gap",
      v: (k.gapBps >= 0 ? "+" : "") + k.gapBps + " bps",
      s: (k.gapBps >= 0 ? "Superando" : "Por debajo de") + " tu benchmark",
      cls: (k.gapBps >= 0 ? "pos" : "neg") as "pos" | "neg",
    },
  ];

  const row2 = [
    {
      l: "Rentabilidad en €",
      v: (k.retEur >= 0 ? "+" : "") + fmt(k.retEur),
      s: "Dinero nuevo: " + (k.newMoneyEur >= 0 ? "+" : "") + fmt(k.newMoneyEur),
      cls: (k.retEur >= 0 ? "pos" : "neg") as "pos" | "neg",
    },
    {
      l: "Volatilidad / MaxDD",
      v: k.vol.toFixed(1) + "% / " + k.maxDd.toFixed(1) + "%",
      s: "Sharpe Ratio: " + k.sharpe.toFixed(2),
      cls: "" as const,
    },
    {
      l: "Cash Drag",
      v: (k.cashDragBps >= 0 ? "-" : "") + Math.abs(k.cashDragBps) + " bps",
      s: "Coste oportunidad de mantener liquidez",
      cls: "neg" as const,
    },
    {
      l: "Mejor / Peor Mes",
      v: fmtPct(k.best.v) + " / " + fmtPct(k.worst.v),
      s: k.best.m + " / " + k.worst.m,
      cls: "" as const,
    },
  ];

  return (
    <>
      <div className="kpi-row" id="kpis">
        {row1.map((c) => (
          <Card key={c.l} {...c} />
        ))}
      </div>
      <div className="kpi-row" id="kpis2">
        {row2.map((c) => (
          <Card key={c.l} {...c} bigValueSize={false} />
        ))}
      </div>
    </>
  );
}

function Card({
  l,
  v,
  s,
  cls,
  bigValueSize = true,
}: {
  l: string;
  v: string;
  s: string;
  cls: "pos" | "neg" | "";
  bigValueSize?: boolean;
}) {
  return (
    <div className="kpi">
      <div className="kpi-label">{l}</div>
      <div
        className={`kpi-value ${cls}`}
        style={bigValueSize ? undefined : { fontSize: "1.2rem" }}
      >
        {v}
      </div>
      <div className="kpi-sub">{s}</div>
    </div>
  );
}
