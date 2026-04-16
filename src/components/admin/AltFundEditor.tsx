import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useSnapshot, dataStore } from "../../data/store";
import { ALT_TYPES, type AltFund } from "../../data/schema";
import { fmt } from "../../lib/format";

/** Editor for the Alternativos vehicles + target allocation per type. */
export function AltFundEditor() {
  const { state } = useDashboard();
  const snapshot = useSnapshot();
  const funds = snapshot.alternativos[state.port];
  const targets = snapshot.alternativos.targets;
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (f: AltFund) => {
    dataStore.addAltFund(state.port, f);
    setShowAdd(false);
  };

  const handleRemove = (name: string) => {
    if (!window.confirm(`¿Eliminar el fondo "${name}"?`)) return;
    dataStore.removeAltFund(state.port, name);
  };

  const total = funds.reduce((s, f) => s + f.committed, 0);

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
          <h3 style={{ margin: 0 }}>Alternativos · {state.port.toUpperCase()}</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
            {funds.length} vehículos · Compromiso total {fmt(total)}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={smallBtn("#10b981", 12)}>
          + Añadir fondo
        </button>
      </div>

      {showAdd && <AddAltForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />}

      <div style={{ overflow: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <Th align="left">Fondo</Th>
              <Th align="left">Tipo</Th>
              <Th>Añada</Th>
              <Th>Compromiso (€)</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {funds.map((f, i) => (
              <AltRow
                key={f.name}
                fund={f}
                rowBg={i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.4)"}
                onRemove={() => handleRemove(f.name)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style={{ margin: "0 0 6px 0", color: "#e2e8f0", fontSize: 13 }}>Objetivo (%) por tipo</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ALT_TYPES.map((t) => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 11, minWidth: 60 }}>{t}</span>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                defaultValue={targets[t] ?? 0}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (isFinite(v)) dataStore.setAltTarget(t, v);
                }}
                style={{ ...inputStyle, width: 70 }}
              />
              <span style={{ color: "#94a3b8", fontSize: 11 }}>%</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function AltRow({
  fund,
  rowBg,
  onRemove,
}: {
  fund: AltFund;
  rowBg: string;
  onRemove: () => void;
}) {
  const { state } = useDashboard();
  const update = <K extends keyof AltFund>(field: K, value: AltFund[K]) => {
    dataStore.updateAltFund(state.port, fund.name, { [field]: value });
  };
  return (
    <tr style={{ background: rowBg, borderBottom: "1px solid #1e293b" }}>
      <td style={{ padding: "5px 6px" }}>
        <input
          type="text"
          defaultValue={fund.name}
          onBlur={(e) => update("name", e.target.value)}
          style={inputStyle}
        />
      </td>
      <td style={{ padding: "5px 6px" }}>
        <select
          defaultValue={fund.type}
          onChange={(e) => update("type", e.target.value as AltFund["type"])}
          style={selectStyle}
        >
          {ALT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td style={{ padding: "5px 6px" }}>
        <input
          type="number"
          defaultValue={fund.vintage}
          onBlur={(e) => {
            const v = parseInt(e.target.value, 10);
            if (isFinite(v)) update("vintage", v);
          }}
          style={{ ...inputStyle, width: 80, textAlign: "right" }}
        />
      </td>
      <td style={{ padding: "5px 6px" }}>
        <input
          type="number"
          defaultValue={fund.committed}
          onBlur={(e) => {
            const v = parseFloat(e.target.value);
            if (isFinite(v)) update("committed", v);
          }}
          style={{ ...inputStyle, width: 140, textAlign: "right" }}
        />
      </td>
      <td style={{ padding: "5px 6px", textAlign: "center" }}>
        <button onClick={onRemove} style={smallBtn("#ef4444", 11)}>
          🗑
        </button>
      </td>
    </tr>
  );
}

function AddAltForm({
  onAdd,
  onCancel,
}: {
  onAdd: (f: AltFund) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AltFund>({
    name: "",
    type: "Buyout",
    vintage: new Date().getFullYear(),
    committed: 0,
  });
  const submit = () => {
    if (!form.name) {
      window.alert("El nombre es obligatorio.");
      return;
    }
    onAdd(form);
  };
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid #10b981",
        borderRadius: 8,
        marginBottom: 12,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 8,
      }}
    >
      <label style={col}>
        <span style={lbl}>Nombre del fondo</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label style={col}>
        <span style={lbl}>Tipo</span>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as AltFund["type"] })}
          style={selectStyle}
        >
          {ALT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label style={col}>
        <span style={lbl}>Añada</span>
        <input
          type="number"
          value={form.vintage}
          onChange={(e) => setForm({ ...form, vintage: parseInt(e.target.value, 10) || 0 })}
          style={inputStyle}
        />
      </label>
      <label style={col}>
        <span style={lbl}>Compromiso (€)</span>
        <input
          type="number"
          value={form.committed}
          onChange={(e) => setForm({ ...form, committed: parseFloat(e.target.value) || 0 })}
          style={inputStyle}
        />
      </label>
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        <button onClick={onCancel} style={smallBtn("#64748b", 11)}>Cancelar</button>
        <button onClick={submit} style={smallBtn("#10b981", 11)}>Añadir</button>
      </div>
    </div>
  );
}

// ─── Styling ───
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
const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const lbl: React.CSSProperties = {
  fontSize: 10,
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
};
function smallBtn(color: string, size = 12): React.CSSProperties {
  return {
    background: color,
    border: "none",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 4,
    fontSize: size,
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
      }}
    >
      {children}
    </th>
  );
}
