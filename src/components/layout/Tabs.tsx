import { useHashRoute } from "../../hooks/useHashRoute";

interface TabDef {
  id: string;
  label: string;
  badge?: { text: string; color: string };
  hidden?: boolean;
}

const TABS: TabDef[] = [
  { id: "resumen", label: "Resumen" },
  { id: "evolucion", label: "Evolución" },
  { id: "consolidado", label: "Consolidado", hidden: true },
  { id: "costes", label: "Costes" },
  { id: "bancos", label: "Bancos" },
  { id: "titulares", label: "Titulares" },
  { id: "organigrama", label: "Organigrama" },
  { id: "liquidez", label: "Liquidez", badge: { text: "(demo)", color: "#60a5fa" } },
  { id: "proyeccion", label: "Proyección", badge: { text: "(beta)", color: "#f59e0b" } },
  { id: "alternativos", label: "Alternativos" },
  { id: "rebalanceo", label: "Rebalanceo" },
  { id: "diversificacion", label: "Diversificación" },
  { id: "admin", label: "Admin", badge: { text: "⚙", color: "#f59e0b" } },
];

export function Tabs() {
  const [route, navigate] = useHashRoute();
  return (
    <div className="tabs">
      {TABS.filter((t) => !t.hidden).map((t) => (
        <button
          key={t.id}
          className={`tab-btn ${route.tab === t.id ? "active" : ""}`}
          onClick={() => navigate({ tab: t.id, sub: null })}
        >
          {t.label}
          {t.badge && (
            <span style={{ fontSize: 9, color: t.badge.color, fontWeight: 700, marginLeft: 4 }}>
              {t.badge.text}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
