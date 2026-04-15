import { useDashboard } from "../../context/DashboardContext";

export function Topbar() {
  const { state, set } = useDashboard();

  return (
    <>
      <div
        style={{
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          color: "#94a3b8",
          textAlign: "center",
          padding: "6px 16px",
          fontSize: 12,
          position: "sticky",
          top: 0,
          zIndex: 9999,
        }}
      >
        ⚠️ Datos de demostración generados automáticamente por IA — Los nombres, cifras y productos son ficticios y pueden contener errores
      </div>
      <div className="topbar">
        <h1>
          <span>Family Office</span> · Dashboard de Posiciones{" "}
          <span
            style={{
              fontSize: "0.45em",
              opacity: 0.5,
              marginLeft: 8,
              background: "#ef4444",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            DEMO
          </span>
        </h1>
        <div className="port-toggle">
          <button
            className={`port-btn ${state.port === "bca" ? "active" : ""}`}
            onClick={() => set("port", "bca")}
          >
            Mendoza Family Office
          </button>
        </div>
      </div>
    </>
  );
}
