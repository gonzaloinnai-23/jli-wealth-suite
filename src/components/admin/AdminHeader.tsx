import { useRef } from "react";
import { dataStore } from "../../data/store";

/**
 * Admin header with the three dataset-level actions:
 *   Export → downloads a JSON file of the current snapshot.
 *   Import → reads a JSON file, validates it, replaces the snapshot.
 *   Reset  → restores the bundled defaults (asks for confirmation).
 *
 * These all go through the DataStore, which persists to localStorage and
 * notifies every subscribed component so the dashboard recomputes live.
 */
export function AdminHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = dataStore.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `portfolio-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      dataStore.importJson(text);
      window.alert("✓ Snapshot importado correctamente. El dashboard se ha actualizado.");
    } catch (err) {
      window.alert(
        "❌ El archivo no es un snapshot válido:\n\n" +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      // Reset input so the same file can be imported twice.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    const ok = window.confirm(
      "¿Restaurar los datos originales?\n\n" +
        "Se perderán todos los cambios guardados en este navegador. " +
        "Si quieres conservarlos, usa 'Exportar' antes."
    );
    if (ok) dataStore.reset();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "12px 16px",
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <strong style={{ color: "#e2e8f0", marginRight: 8 }}>Gestor de datos</strong>
      <span style={{ color: "#94a3b8", fontSize: 12, marginRight: "auto" }}>
        Los cambios se guardan automáticamente en este navegador (localStorage).
      </span>
      <ActionBtn onClick={handleExport} color="#3b82f6">
        📥 Exportar JSON
      </ActionBtn>
      <label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          style={{ display: "none" }}
        />
        <ActionBtn as="span" color="#10b981">
          📤 Importar JSON
        </ActionBtn>
      </label>
      <ActionBtn onClick={handleReset} color="#ef4444">
        ↻ Reset
      </ActionBtn>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  color,
  as = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color: string;
  as?: "button" | "span";
}) {
  const style: React.CSSProperties = {
    background: color,
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
    display: "inline-block",
  };
  if (as === "span") {
    return (
      <span role="button" style={style}>
        {children}
      </span>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}
