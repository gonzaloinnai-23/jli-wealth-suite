import { useDashboard } from "../../context/DashboardContext";
import { EvoStackChart } from "./EvoStackChart";
import { EvoBenchChart } from "./EvoBenchChart";
import { ProductHeatmap } from "../heatmap/ProductHeatmap";
import { AlphaAttributionChart } from "./AlphaAttributionChart";

/** Evolución tab: asset-class evolution + portfolio vs benchmark. */
export function Evolucion() {
  const { state, set } = useDashboard();

  return (
    <div id="evolucion" className="tab-content active">
      <SectionHeader
        icon="📊"
        title="Evolución Patrimonial"
        subtitle="Cómo ha crecido tu patrimonio por clase de activo y cómo se compara con el benchmark."
      />

      <div className="chart-row chart-full">
        <div className="chart-box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Evolución del Patrimonio por Clase de Activo (€)</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
              Patrimonio desglosado por clases: Renta Variable, Renta Fija, Oro, Alternativos y
              Liquidez. Puedes alternar entre la evolución real (con aportaciones) o solo la
              rentabilidad generada.
            </p>
            <div style={{ display: "flex", gap: 0 }}>
              <ToggleBtn
                active={state.evoStackMode === "real"}
                onClick={() => set("evoStackMode", "real")}
                position="left"
              >
                Con Dinero Nuevo
              </ToggleBtn>
              <ToggleBtn
                active={state.evoStackMode === "twr"}
                onClick={() => set("evoStackMode", "twr")}
                position="right"
              >
                Solo Rentabilidad
              </ToggleBtn>
            </div>
          </div>
          <div style={{ height: 500 }}>
            <EvoStackChart />
          </div>
        </div>
      </div>

      <div className="chart-row chart-full">
        <div className="chart-box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <h3 style={{ margin: 0 }}>Cartera vs Benchmark Replicado (€)</h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
              Compara tu cartera real contra un benchmark que replica tus mismos pesos con índices
              de mercado. La diferencia muestra el alpha (o déficit) generado por la selección de
              fondos.
            </p>
            <div style={{ display: "flex", gap: 0 }}>
              <ToggleBtn
                active={state.evoBenchMode === "real"}
                onClick={() => set("evoBenchMode", "real")}
                position="left"
              >
                Con Dinero Nuevo
              </ToggleBtn>
              <ToggleBtn
                active={state.evoBenchMode === "twr"}
                onClick={() => set("evoBenchMode", "twr")}
                position="right"
              >
                Solo Rentabilidad
              </ToggleBtn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
            {(
              [
                ["all", "Todos"],
                ["rv", "Renta Variable"],
                ["rf", "Renta Fija"],
                ["gold", "Oro / Mat.Primas"],
                ["alt", "Alternativos"],
              ] as const
            ).map(([k, label]) => (
              <FilterBtn
                key={k}
                active={state.evoBenchFilter === k}
                onClick={() => set("evoBenchFilter", k)}
              >
                {label}
              </FilterBtn>
            ))}
          </div>
          <div style={{ height: 400 }}>
            <EvoBenchChart />
          </div>
        </div>
      </div>

      <SectionHeader
        icon="🎯"
        title="Análisis del Alpha"
        subtitle="¿Por qué tu cartera supera (o no) al benchmark? Descomposición por selección de fondos y coste de liquidez."
      />
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Atribución del Alpha por Clase</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Cada barra muestra cuánto aporta (o resta) cada factor: selección de fondos por
            clase y coste de mantener liquidez.
          </p>
          <AlphaAttributionChart />
        </div>
      </div>

      <SectionHeader
        icon="🔥"
        title="Rentabilidad por Producto"
        subtitle="Mapa de calor con la rentabilidad mensual de cada producto. Verde = mes positivo, rojo = mes negativo."
      />
      <ProductHeatmap />
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ margin: "8px 0 14px 0", paddingBottom: 6, borderBottom: "1px solid #334155" }}>
      <h2 style={{ margin: 0, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.5px" }}>
        {icon} {title}
      </h2>
      <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#64748b" }}>{subtitle}</p>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
  position,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  position: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        fontSize: 11,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        borderRadius: position === "left" ? "6px 0 0 6px" : "0 6px 6px 0",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "3px 10px",
        fontSize: 10,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        borderRadius: 4,
      }}
    >
      {children}
    </button>
  );
}
