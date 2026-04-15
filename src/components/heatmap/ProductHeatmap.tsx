import { Fragment, useMemo, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useFilteredMonths } from "../../hooks/useFilteredMonths";
import { getEnriched } from "../../lib/calc";
import { fmtPct, hmColor } from "../../lib/format";

/**
 * Rentabilidad por Producto — monthly return heatmap grouped by tipologia.
 * Cells colour-coded by `hmColor` (-6% → red … 0 → gray … +6% → green).
 */
export function ProductHeatmap() {
  const { state } = useDashboard();
  const months = useFilteredMonths();
  const [filter, setFilter] = useState<string>("");

  const { groups, tipologias } = useMemo(() => {
    const d = getEnriched(state.port);
    const prods = d.products.filter((p) => p.tipologia !== "Cuenta Corriente");
    const allTipos = Array.from(new Set(prods.map((p) => p.tipologia)));
    const filtered = filter ? prods.filter((p) => p.tipologia === filter) : prods;
    const g: Record<string, typeof prods> = {};
    filtered.forEach((p) => {
      if (!g[p.tipologia]) g[p.tipologia] = [];
      g[p.tipologia].push(p);
    });
    return { groups: g, tipologias: allTipos };
  }, [state.port, filter]);

  return (
    <>
      <div className="hm-controls">
        <label>Filtrar por Tipología:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todas</option>
          {tipologias.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="legend">
        <span>-6%</span>
        <div className="legend-bar" />
        <span>+6%</span>
      </div>
      <div className="hm-wrap">
        <table className="hm-table">
          <thead>
            <tr>
              <th className="corner">Producto</th>
              {months.map((mi) => (
                <th key={mi}>{mi}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([tipo, prods]) => (
              <Fragment key={tipo}>
                <tr className="sep">
                  <td colSpan={months.length + 1}>{tipo}</td>
                </tr>
                {prods.map((p) => {
                  const name =
                    p.producto.length > 40 ? p.producto.slice(0, 38) + "…" : p.producto;
                  const sub = p.titular + "/" + p.banco;
                  return (
                    <tr key={p.producto}>
                      <td className="pname" title={`${p.producto} (${sub})`}>
                        {name}{" "}
                        <span style={{ color: "#64748b", fontSize: 9 }}>{sub}</span>
                      </td>
                      {months.map((mi) => {
                        const raw = p.difmes[mi];
                        const v = raw != null ? raw : null;
                        const bg = hmColor(v);
                        const dark = v === null;
                        const txtCol = dark
                          ? "#4b5563"
                          : Math.abs(v!) > 3.5
                          ? "#fff"
                          : v! > 0
                          ? "#14532d"
                          : v! < 0
                          ? "#7f1d1d"
                          : "#475569";
                        return (
                          <td
                            key={mi}
                            className="hm-cell"
                            style={{ background: bg, color: txtCol }}
                            title={v != null ? `${p.producto} ${mi}: ${fmtPct(v)}` : ""}
                          >
                            {v != null ? fmtPct(v) : ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
