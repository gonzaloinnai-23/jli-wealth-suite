import { DashboardProvider } from "./context/DashboardContext";
import { useHashRoute } from "./hooks/useHashRoute";
import { Topbar } from "./components/layout/Topbar";
import { Tabs } from "./components/layout/Tabs";
import { TimeSlider } from "./components/layout/TimeSlider";
import { Resumen } from "./components/resumen/Resumen";
import { Evolucion } from "./components/evolucion/Evolucion";
import { Bancos } from "./components/bancos/Bancos";
import { Costes } from "./components/costes/Costes";
import { Titulares } from "./components/titulares/Titulares";
import { Organigrama } from "./components/organigrama/Organigrama";
import { Alternativos } from "./components/alternativos/Alternativos";
import { Liquidez } from "./components/liquidez/Liquidez";
import { Proyeccion } from "./components/proyeccion/Proyeccion";
import { Rebalanceo } from "./components/rebalanceo/Rebalanceo";
import { Diversificacion } from "./components/diversificacion/Diversificacion";
import { TabPlaceholder } from "./components/layout/TabPlaceholder";

function RoutedContent() {
  const [route] = useHashRoute();
  switch (route.tab) {
    case "resumen":
      return <Resumen />;
    case "evolucion":
      return <Evolucion />;
    case "costes":
      return <Costes />;
    case "bancos":
      return <Bancos />;
    case "titulares":
      return <Titulares />;
    case "organigrama":
      return <Organigrama />;
    case "liquidez":
      return <Liquidez />;
    case "proyeccion":
      return <Proyeccion />;
    case "alternativos":
      return <Alternativos />;
    case "rebalanceo":
      return <Rebalanceo />;
    case "diversificacion":
      return <Diversificacion />;
    default:
      return <Resumen />;
  }
}

export default function App() {
  return (
    <DashboardProvider>
      <Topbar />
      <Tabs />
      <TimeSlider />
      <div className="content">
        <RoutedContent />
      </div>
    </DashboardProvider>
  );
}
