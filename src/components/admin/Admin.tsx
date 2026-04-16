import { useState } from "react";
import { AdminHeader } from "./AdminHeader";
import { ProductEditor } from "./ProductEditor";
import { AltFundEditor } from "./AltFundEditor";
import { ConstantsViewer } from "./ConstantsViewer";

type Section = "products" | "alternativos" | "constants";

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: "products", label: "Productos", icon: "📦" },
  { key: "alternativos", label: "Alternativos", icon: "🏛️" },
  { key: "constants", label: "Constantes", icon: "📊" },
];

/**
 * Admin tab — data management UI. Combines the export/import header with
 * per-section editors for products (and their monthly values), alternative
 * vehicles, and a read-only viewer for the market constants.
 */
export function Admin() {
  const [section, setSection] = useState<Section>("products");

  return (
    <div id="admin" className="tab-content active">
      <AdminHeader />

      <div style={{ display: "flex", gap: 0, marginBottom: 14, flexWrap: "wrap" }}>
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              border: "1px solid #334155",
              background: section === s.key ? "#3b82f6" : "#1e293b",
              color: section === s.key ? "#fff" : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              borderRadius:
                i === 0
                  ? "6px 0 0 6px"
                  : i === SECTIONS.length - 1
                  ? "0 6px 6px 0"
                  : 0,
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {section === "products" && <ProductEditor />}
      {section === "alternativos" && <AltFundEditor />}
      {section === "constants" && <ConstantsViewer />}
    </div>
  );
}
