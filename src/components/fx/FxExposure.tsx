import { useDashboard } from "../../context/DashboardContext";
import { FxChart } from "./FxChart";
import { FxCostChart } from "./FxCostChart";
import { FxByClassChart } from "./FxByClassChart";

/** Wraps the 3 FX charts for the Resumen tab's "Exposición al Dólar" section. */
export function FxExposure() {
  const { state, set } = useDashboard();
  return (
    <>
      <div className="chart-row chart-full">
        <div className="chart-box">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>EUR/USD y Exposición Implícita al Dólar</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>
                Tipo de cambio EUR/USD y porcentaje de tu cartera expuesto económicamente al
                dólar.
              </p>
            </div>
            <div style={{ display: "flex", gap: 0 }}>
              <ModeBtn
                active={state.fxMode === "total"}
                onClick={() => set("fxMode", "total")}
                position="left"
              >
                Total
              </ModeBtn>
              <ModeBtn
                active={state.fxMode === "byclass"}
                onClick={() => set("fxMode", "byclass")}
                position="right"
              >
                Por Activo
              </ModeBtn>
            </div>
          </div>
          {state.fxMode === "byclass" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {(["RV", "RF_USD", "ALT", "MULTI"] as const).map((c) => (
                <ClassBtn
                  key={c}
                  active={state.fxClass === c}
                  onClick={() => set("fxClass", c)}
                >
                  {CLASS_LABEL[c]}
                </ClassBtn>
              ))}
            </div>
          )}
          <FxChart />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-box">
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 4px 0" }}>Precio Medio de Compra EUR/USD</h3>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
              Tipo de cambio medio ponderado al que se ha acumulado exposición al dólar.{" "}
              <span style={{ color: "#22d3ee" }}>▬</span> EUR/USD spot &nbsp;
              <span style={{ color: "#fb923c" }}>▬▬</span> Precio medio entrada USD
            </p>
          </div>
          <div style={{ height: 220 }}>
            <FxCostChart />
          </div>
        </div>
        <div className="chart-box">
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 4px 0" }}>Exposición al Dólar por Clase de Activo</h3>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
              Desglose de la exposición económica al USD por tipo de activo.
            </p>
          </div>
          <div style={{ height: 250 }}>
            <FxByClassChart />
          </div>
        </div>
      </div>
    </>
  );
}

const CLASS_LABEL: Record<"RV" | "RF_USD" | "ALT" | "MULTI", string> = {
  RV: "Renta Variable",
  RF_USD: "RF en Dólar",
  ALT: "Alternativos",
  MULTI: "Multiactivo",
};

function ModeBtn({
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
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function ClassBtn({
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
        padding: "4px 11px",
        fontSize: 11,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        borderRadius: 5,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
