import { Fragment, useMemo, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useSnapshot, dataStore } from "../../data/store";
import { TIPOLOGIAS, type Product } from "../../data/schema";
import { fmt } from "../../lib/format";

/**
 * Edits the list of products for the active portfolio — each row covers
 * metadata (producto, isin, tipologia, banco, titular, divisa). A nested
 * "Valores" button opens a month-by-month editor for `valor` and `difmes`.
 */
export function ProductEditor() {
  const { state } = useDashboard();
  const snapshot = useSnapshot();
  const portSet = snapshot.portfolio[state.port];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const totalNow = useMemo(() => {
    const last = portSet.months[portSet.months.length - 1];
    return portSet.products.reduce((s, p) => s + (p.valor[last] || 0), 0);
  }, [portSet]);

  const handleAdd = (p: Product) => {
    try {
      dataStore.addProduct(state.port, p);
      setShowAdd(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemove = (isin: string, name: string) => {
    if (!window.confirm(`¿Eliminar el producto "${name}"?`)) return;
    dataStore.removeProduct(state.port, isin);
    if (expanded === isin) setExpanded(null);
  };

  return (
    <div className="chart-box" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Productos · cartera {state.port.toUpperCase()}</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
            {portSet.products.length} posiciones · Patrimonio total {fmt(totalNow)} en{" "}
            {portSet.months[portSet.months.length - 1]}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "#10b981",
            border: "none",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          + Añadir producto
        </button>
      </div>

      {showAdd && <AddProductForm months={portSet.months} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />}

      <div style={{ overflow: "auto", maxHeight: 540 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#0f172a", zIndex: 1 }}>
              <Th align="left">Producto</Th>
              <Th align="left">ISIN</Th>
              <Th align="left">Tipología</Th>
              <Th align="left">Banco</Th>
              <Th align="left">Titular</Th>
              <Th>Divisa</Th>
              <Th>Valor</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {portSet.products.map((p, i) => {
              const last = portSet.months[portSet.months.length - 1];
              const vNow = p.valor[last] || 0;
              const rowBg = i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.4)";
              // Row key: positional. The product array is never reordered in
              // this UI so index-based keys are safe and guaranteed unique,
              // which matters because some products share an empty ISIN.
              const rowKey = `row-${i}`;
              const isOpen = expanded === rowKey;
              return (
                <Row
                  key={rowKey}
                  product={p}
                  rowBg={rowBg}
                  vNow={vNow}
                  isOpen={isOpen}
                  months={portSet.months}
                  onToggle={() => setExpanded(isOpen ? null : rowKey)}
                  onRemove={() => handleRemove(p.isin, p.producto)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  product,
  rowBg,
  vNow,
  isOpen,
  months,
  onToggle,
  onRemove,
}: {
  product: Product;
  rowBg: string;
  vNow: number;
  isOpen: boolean;
  months: string[];
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { state } = useDashboard();

  const updateField = <K extends keyof Product>(field: K, value: Product[K]) => {
    dataStore.updateProduct(state.port, product.isin, { [field]: value });
  };

  return (
    <Fragment>
      <tr style={{ background: rowBg, borderBottom: "1px solid #1e293b" }}>
        <td style={{ padding: "5px 6px" }}>
          <input
            type="text"
            defaultValue={product.producto}
            onBlur={(e) => updateField("producto", e.target.value)}
            style={inputStyle}
          />
        </td>
        <td style={{ padding: "5px 6px" }}>
          <span style={{ color: "#64748b", fontSize: 11 }} title="La ISIN no se puede modificar desde aquí">
            {product.isin}
          </span>
        </td>
        <td style={{ padding: "5px 6px" }}>
          <select
            defaultValue={product.tipologia}
            onChange={(e) => updateField("tipologia", e.target.value as Product["tipologia"])}
            style={selectStyle}
          >
            {TIPOLOGIAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </td>
        <td style={{ padding: "5px 6px" }}>
          <input
            type="text"
            defaultValue={product.banco}
            onBlur={(e) => updateField("banco", e.target.value)}
            style={inputStyle}
          />
        </td>
        <td style={{ padding: "5px 6px" }}>
          <input
            type="text"
            defaultValue={product.titular}
            onBlur={(e) => updateField("titular", e.target.value)}
            style={inputStyle}
          />
        </td>
        <td style={{ padding: "5px 6px" }}>
          <select
            defaultValue={product.divisa}
            onChange={(e) => updateField("divisa", e.target.value as Product["divisa"])}
            style={selectStyle}
          >
            {["EUR", "USD", "GBP", "CHF", "JPY"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </td>
        <td style={{ padding: "5px 6px", textAlign: "right", color: "#e2e8f0", fontWeight: 600 }}>
          {fmt(vNow)}
        </td>
        <td style={{ padding: "5px 6px", textAlign: "center" }}>
          <button onClick={onToggle} style={smallBtn("#3b82f6")}>
            {isOpen ? "Cerrar" : "Valores"}
          </button>{" "}
          <button onClick={onRemove} style={smallBtn("#ef4444")}>
            🗑
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={8} style={{ padding: "6px 12px 14px 12px", background: "rgba(59,130,246,0.04)" }}>
            <MonthlyValuesEditor product={product} months={months} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

function MonthlyValuesEditor({ product, months }: { product: Product; months: string[] }) {
  const { state } = useDashboard();

  return (
    <div>
      <p style={{ margin: "0 0 8px 0", fontSize: 11, color: "#94a3b8" }}>
        Valor (€) y rentabilidad mensual (%). Los valores se guardan al salir del campo (blur).
      </p>
      <div style={{ overflow: "auto", maxHeight: 280 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#0f172a" }}>
              <th style={{ ...thStyleCompact, textAlign: "left", minWidth: 60 }}>Mes</th>
              <th style={thStyleCompact}>Valor (€)</th>
              <th style={thStyleCompact}>Dif. mes (%)</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m}>
                <td style={{ padding: "3px 6px", color: "#94a3b8", fontSize: 10 }}>{m}</td>
                <td style={{ padding: "3px 4px" }}>
                  <input
                    type="number"
                    defaultValue={product.valor[m] ?? 0}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isFinite(v)) return;
                      dataStore.setProductMonthValue(
                        state.port,
                        product.isin,
                        m,
                        v,
                        product.difmes[m] ?? 0
                      );
                    }}
                    style={cellInputStyle}
                  />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={product.difmes[m] ?? 0}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isFinite(v)) return;
                      dataStore.setProductMonthValue(
                        state.port,
                        product.isin,
                        m,
                        product.valor[m] ?? 0,
                        v
                      );
                    }}
                    style={cellInputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddProductForm({
  months,
  onAdd,
  onCancel,
}: {
  months: string[];
  onAdd: (p: Product) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Product, "valor" | "difmes">>({
    producto: "",
    isin: "",
    tipologia: "Fondo Renta Variable",
    banco: "Goldman Sachs",
    titular: "",
    divisa: "EUR",
  });

  const submit = () => {
    if (!form.producto || !form.isin) {
      window.alert("Nombre e ISIN son obligatorios.");
      return;
    }
    const valor: Record<string, number> = {};
    const difmes: Record<string, number> = {};
    months.forEach((m) => {
      valor[m] = 0;
      difmes[m] = 0;
    });
    onAdd({ ...form, valor, difmes });
  };

  return (
    <div
      style={{
        padding: "12px 14px",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid #10b981",
        borderRadius: 8,
        marginBottom: 12,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: 8,
      }}
    >
      <Field label="Nombre del producto">
        <input
          type="text"
          value={form.producto}
          onChange={(e) => setForm({ ...form, producto: e.target.value })}
          style={inputStyle}
          placeholder="Ej: iShares Core MSCI World"
        />
      </Field>
      <Field label="ISIN">
        <input
          type="text"
          value={form.isin}
          onChange={(e) => setForm({ ...form, isin: e.target.value })}
          style={inputStyle}
          placeholder="IE00B4L5Y983"
        />
      </Field>
      <Field label="Tipología">
        <select
          value={form.tipologia}
          onChange={(e) => setForm({ ...form, tipologia: e.target.value as Product["tipologia"] })}
          style={selectStyle}
        >
          {TIPOLOGIAS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Banco">
        <input
          type="text"
          value={form.banco}
          onChange={(e) => setForm({ ...form, banco: e.target.value })}
          style={inputStyle}
        />
      </Field>
      <Field label="Titular">
        <input
          type="text"
          value={form.titular}
          onChange={(e) => setForm({ ...form, titular: e.target.value })}
          style={inputStyle}
        />
      </Field>
      <Field label="Divisa">
        <select
          value={form.divisa}
          onChange={(e) => setForm({ ...form, divisa: e.target.value as Product["divisa"] })}
          style={selectStyle}
        >
          {["EUR", "USD", "GBP", "CHF", "JPY"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onCancel} style={smallBtn("#64748b")}>Cancelar</button>
        <button onClick={submit} style={smallBtn("#10b981")}>Añadir</button>
      </div>
    </div>
  );
}

// ─── Styling helpers ───

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#e2e8f0",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "inherit",
};
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "auto" };
const cellInputStyle: React.CSSProperties = {
  width: 100,
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#e2e8f0",
  padding: "2px 6px",
  borderRadius: 3,
  fontSize: 11,
  textAlign: "right",
  fontFamily: "inherit",
};
const thStyleCompact: React.CSSProperties = {
  padding: "5px 8px",
  color: "#94a3b8",
  borderBottom: "1px solid #334155",
  fontSize: 10,
  whiteSpace: "nowrap",
};
function smallBtn(color: string): React.CSSProperties {
  return {
    background: color,
    border: "none",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  };
}
function Th({ children, align = "center" }: { children: React.ReactNode; align?: "left" | "center" }) {
  return (
    <th
      style={{
        padding: "6px 8px",
        color: "#94a3b8",
        borderBottom: "1px solid #334155",
        textAlign: align,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
