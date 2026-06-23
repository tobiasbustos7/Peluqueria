import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAutenticacion } from "./hooks/useAutenticacion";
import InicioSesion from "./paginas/InicioSesion";
import Registro from "./paginas/Registro";
import PanelControl from "./paginas/PanelControl";
import Servicios from "./paginas/Servicios";
import Horarios from "./paginas/Horarios";
import Calendario from "./paginas/Calendario";
import MisTurnos from "./paginas/MisTurnos";
import Fidelizacion from "./paginas/Fidelizacion";
import Empleados from "./paginas/Empleados";
import Estadisticas from "./paginas/Estadisticas";
import Perfil from "./paginas/Perfil";
import OlvideContrasena from "./paginas/OlvideContrasena";
import NoEncontrado from "./paginas/NoEncontrado";
import Encabezado from "./componentes/Encabezado";
import fondo from "./assets/background.png";

function FondoDecorativo() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${fondo})` }}
    />
  );
}

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario } = useAutenticacion();
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  return (
    <>
      <FondoDecorativo />
      {children}
    </>
  );
}

function RutaPublica({ children }: { children: React.ReactNode }) {
  const { usuario } = useAutenticacion();
  if (usuario) return <Navigate to="/panel" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/iniciar-sesion" element={<RutaPublica><InicioSesion /></RutaPublica>} />
        <Route path="/registrarse" element={<RutaPublica><Registro /></RutaPublica>} />
        <Route path="/olvide-contrasena" element={<RutaPublica><OlvideContrasena /></RutaPublica>} />
        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <Encabezado />
              <PanelControl />
            </RutaProtegida>
          }
        />
        <Route
          path="/servicios"
          element={
            <RutaProtegida>
              <Encabezado />
              <Servicios />
            </RutaProtegida>
          }
        />
        <Route
          path="/horarios"
          element={
            <RutaProtegida>
              <Encabezado />
              <Horarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/turnos"
          element={
            <RutaProtegida>
              <Encabezado />
              <Calendario />
            </RutaProtegida>
          }
        />
        <Route
          path="/fidelizacion"
          element={
            <RutaProtegida>
              <Encabezado />
              <Fidelizacion />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-turnos"
          element={
            <RutaProtegida>
              <Encabezado />
              <MisTurnos />
            </RutaProtegida>
          }
        />
        <Route
          path="/empleados"
          element={
            <RutaProtegida>
              <Encabezado />
              <Empleados />
            </RutaProtegida>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <RutaProtegida>
              <Encabezado />
              <Estadisticas />
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Encabezado />
              <Perfil />
            </RutaProtegida>
          }
        />
        <Route path="/" element={<Navigate to="/panel" replace />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
