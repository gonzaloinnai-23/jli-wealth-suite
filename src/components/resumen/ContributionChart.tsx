import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js/auto";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { useChart } from "../../hooks/useChart";
import { getEnriched } from "../../lib/calc";
import { fmtEur } from "../../lib/format";
import type { Product } from "../../data/portfolio";

type ClassKey = "RV" | "RF" | "GOLD" | "ALT";

const CLS_KEYS: ClassKey[] = ["RV", "RF", "GOLD", "ALT"];
const CLS_LABELS: Record<ClassKey, string> = {
  RV: "Renta Variable",
  RF: "Renta Fija",
  GOLD: "Oro / Mat. Primas",
  ALT: "Alternativos / PE",
};
const CLS_COLORS: Record<ClassKey, string> = {
  RV: "#f472b6",
  RF: "#60a5fa",
  GOLD: "#fbbf24",
  ALT: "#f87171",
};

/**
 * Maps a product to its contribution class. Mirrors the local `prodClass`
 * function inside the original's `renderResumen`. Fondo Multiactivo is
 * flagged "SPLIT" and gets divided 50/50 between RV and RF by the caller.
 */
function prodClass(p: Product): ClassKey | "SPLIT" {
  const t = p.tipologia || "";
  if (t === "Fondo Renta Variable" || t === "ETF Renta Variable" || t === "Cartera Gestionada RV")
    return "RV";
  if (
    t === "Cartera Gestionada RF" ||
    t === "Fondo Renta Fija" ||
    t === "Renta Fija Directa" ||
    t === "Fondo Monetario"
  )
    return "RF";
  if (t === "ETF Materias Primas") return "GOLD";
  if (t === "Vehículo Alternativo") return /gold/i.test(p.producto || "") ? "GOLD" : "ALT";
  if (t === "Fondo Multiactivo") return "SPLIT";
  if (t === "Cuenta Corriente") return "RF";
  return "RV";
}

interface AttrResult {
  keys: ClassKey[];
  data: Record<ClassKey, number>;
  tir: Record<ClassKey, number>;
  weight: Record<ClassKey, number>;
  pnl: Record<ClassKey, number>;
}

/** Full attribution calculation over the selected period. */
function computeAttribution(port: "bca" | "bcp", months: string[]): AttrResult {
  const d = getEnriched(port);
  const clsTWR: Record<ClassKey, number> = { RV: 1, RF: 1, GOLD: 1, ALT: 1 };
  const clsSumW: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
  const clsCountW: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
  const clsPnL: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };

  months.forEach((mi, idx) => {
    if (idx === 0) return;
    const classEV: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
    const classSV: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
    d.products.forEach((p) => {
      const ev = (p.valor && p.valor[mi]) || 0;
      if (ev <= 0) return;
      const raw = p.difmes && p.difmes[mi];
      const dm = raw != null && Math.abs(raw) < 50 ? raw : 0;
      const sv = ev / (1 + dm / 100);
      const cls = prodClass(p);
      if (cls === "SPLIT") {
        classEV.RV += ev * 0.5;
        classSV.RV += sv * 0.5;
        classEV.RF += ev * 0.5;
        classSV.RF += sv * 0.5;
      } else {
        classEV[cls] += ev;
        classSV[cls] += sv;
      }
    });
    const totalEV = classEV.RV + classEV.RF + classEV.GOLD + classEV.ALT;
    CLS_KEYS.forEach((k) => {
      const ret = classSV[k] > 0 ? classEV[k] / classSV[k] : 1;
      clsTWR[k] *= ret;
      clsPnL[k] += classEV[k] - classSV[k];
      const w = totalEV > 0 ? classEV[k] / totalEV : 0;
      clsSumW[k] += w;
      clsCountW[k] += 1;
    });
  });

  const nYears = (months.length - 1) / 12;
  const data: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
  const tir: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
  const weight: Record<ClassKey, number> = { RV: 0, RF: 0, GOLD: 0, ALT: 0 };
  CLS_KEYS.forEach((k) => {
    const cumRet = (clsTWR[k] - 1) * 100;
    const avgW = clsCountW[k] > 0 ? clsSumW[k] / clsCountW[k] : 0;
    data[k] = avgW * cumRet;
    tir[k] = nYears > 0 ? (Math.pow(clsTWR[k], 1 / nYears) - 1) * 100 : cumRet;
    weight[k] = avgW * 100;
  });

  const keys = CLS_KEYS.filter((k) => Math.abs(data[k]) > 0.05);
  return { keys, data, tir, weight, pnl: clsPnL };
}

/** Horizontal bar chart + summary table for per-class contribution. */
export function ContributionChart() {
  const { state } = useDashboard();
  const months = useFilteredMonths();
  const attr = useMemo(() => computeAttribution(state.port, months), [state.port, months]);

  const config: ChartConfiguration = useMemo(
    () => ({
      type: "bar",
      data: {
        labels: attr.keys.map((k) => CLS_LABELS[k]),
        datasets: [
          {
            data: attr.keys.map((k) => attr.data[k]),
            backgroundColor: attr.keys.map((k) => CLS_COLORS[k]),
            borderWidth: 0,
            barThickness: 28,
            borderRadius: 3,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const k = attr.keys[ctx.dataIndex] as ClassKey;
                const v = ctx.raw as number;
                return CLS_LABELS[k] + ": " + (v >= 0 ? "+" : "") + v.toFixed(2) + "% del TWR total";
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#64748b",
              callback: (v) => (Number(v) >= 0 ? "+" : "") + Number(v).toFixed(1) + "%",
            },
            grid: { color: "#1e293b" },
          },
          y: {
            ticks: { color: "#e2e8f0", font: { size: 12, weight: "bold" } },
            grid: { display: false },
          },
        },
      },
    }),
    [attr]
  );

  const canvasRef = useChart(config);

  let totalPnL = 0;
  let totalContrib = 0;
  attr.keys.forEach((k) => {
    totalPnL += attr.pnl[k];
    totalContrib += attr.data[k];
  });

  return (
    <>
      <div style={{ height: 160 }}>
        <canvas ref={canvasRef} />
      </div>
      <div id="attrTable" style={{ marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, color: "#cbd5e1" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #334155" }}>
              <Th align="left">Clase</Th>
              <Th>Peso Medio</Th>
              <Th>TIR Anual</Th>
              <Th>P&L (€)</Th>
              <Th>Contribución</Th>
            </tr>
          </thead>
          <tbody>
            {attr.keys.map((k) => {
              const tir = attr.tir[k];
              const eur = attr.pnl[k];
              const contrib = attr.data[k];
              const tirCol = tir >= 0 ? "#34d399" : "#ef4444";
              const eurCol = eur >= 0 ? "#34d399" : "#ef4444";
              return (
                <tr key={k} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "5px 8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: CLS_COLORS[k],
                        marginRight: 6,
                      }}
                    />
                    {CLS_LABELS[k]}
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 8px" }}>
                    {attr.weight[k].toFixed(1)}%
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 8px", color: tirCol, fontWeight: 600 }}>
                    {(tir >= 0 ? "+" : "") + tir.toFixed(1) + "%"}
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 8px", color: eurCol, fontWeight: 600 }}>
                    {fmtEur(eur)}
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 8px", fontWeight: 600 }}>
                    {(contrib >= 0 ? "+" : "") + contrib.toFixed(2) + "%"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid #334155", background: "#0f172a" }}>
              <td style={{ padding: "5px 8px", fontWeight: 700 }}>Total</td>
              <td style={{ textAlign: "right", padding: "5px 8px" }}>100%</td>
              <td style={{ textAlign: "right", padding: "5px 8px" }}>—</td>
              <td
                style={{
                  textAlign: "right",
                  padding: "5px 8px",
                  fontWeight: 700,
                  color: totalPnL >= 0 ? "#34d399" : "#ef4444",
                }}
              >
                {fmtEur(totalPnL)}
              </td>
              <td style={{ textAlign: "right", padding: "5px 8px", fontWeight: 700 }}>
                {(totalContrib >= 0 ? "+" : "") + totalContrib.toFixed(2) + "%"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "5px 8px",
        color: "#94a3b8",
      }}
    >
      {children}
    </th>
  );
}
