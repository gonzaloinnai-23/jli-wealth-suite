import { KpiCards } from "./KpiCards";
import { SubPeriodTable } from "./SubPeriodTable";
import { GrowthChart } from "./GrowthChart";
import { ContributionChart } from "./ContributionChart";
import { RvRfChart } from "./RvRfChart";
import { StackChart } from "../composition/StackChart";
import { DonutChart } from "../composition/DonutChart";
import { FxExposure } from "../fx/FxExposure";

/**
 * Resumen tab — the default view. KPIs and the TWR sub-periods table are
 * fully data-driven from the real portfolio dataset. The remaining charts
 * (Growth, Contribution, RV/RF, Composition, FX) are ported in Fase 2.3+.
 */
export function Resumen() {
  return (
    <div id="resumen" className="tab-content active">
      <KpiCards />

      <SectionHeader
        icon="📈"
        title="Rentabilidad"
        subtitle="¿Cuánto has ganado, de dónde viene y cómo se compara con el mercado?"
      />
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>TWR por Sub-Periodos</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Rentabilidad ponderada por tiempo (TWR) de tu cartera, el benchmark replicado y la
            inflación, desglosada por semestres y el acumulado total.
          </p>
          <div id="subPeriodTable" style={{ overflow: "auto" }}>
            <SubPeriodTable />
          </div>
        </div>
      </div>
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3>Desglose del Crecimiento: Rentabilidad vs Dinero Nuevo</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Separa cuánto del crecimiento patrimonial proviene de la rentabilidad de las
            inversiones frente a las aportaciones/retiradas netas de capital.
          </p>
          <GrowthChart />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-box">
          <h3>Contribución a la Rentabilidad por Clase</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Cuánto ha aportado cada tipo de activo a la rentabilidad total de tu cartera en todo el
            periodo.
          </p>
          <ContributionChart />
        </div>
        <div className="chart-box">
          <h3>Ratio RV/RF: Evolución vs Media</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Evolución del peso de renta variable y renta fija en tu cartera, comparado con su
            media histórica. Útil para ver si el perfil de riesgo se ha desviado.
          </p>
          <RvRfChart />
        </div>
      </div>

      <SectionHeader
        icon="🧩"
        title="Composición de la Cartera"
        subtitle="¿Qué tienes y cómo se reparte el patrimonio?"
      />
      <div className="chart-row">
        <div className="chart-box">
          <h3>Evolución Patrimonial por Tipología</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Patrimonio total mes a mes, desglosado por tipo de producto según la clasificación de
            Family Office (tipología original del informe).
          </p>
          <StackChart />
        </div>
        <div className="chart-box">
          <h3>Composición Actual</h3>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b" }}>
            Distribución del patrimonio por clase de activo (Renta Variable, Renta Fija, Oro y
            Alternativos) en el último mes seleccionado.
          </p>
          <DonutChart />
        </div>
      </div>

      <SectionHeader
        icon="💵"
        title="Exposición al Dólar"
        subtitle="¿Cuánto de tu patrimonio depende del tipo de cambio EUR/USD? Incluye exposición directa (activos en USD) e indirecta (contenido en dólares de fondos globales, oro y alternativos)."
      />
      <FxExposure />
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ margin: "28px 0 14px 0", paddingBottom: 6, borderBottom: "1px solid #334155" }}>
      <h2 style={{ margin: 0, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.5px" }}>
        {icon} {title}
      </h2>
      <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#64748b" }}>{subtitle}</p>
    </div>
  );
}
