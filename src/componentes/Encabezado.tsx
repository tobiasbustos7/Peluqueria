import { Link } from "react-router-dom";
import { useAutenticacion } from "../hooks/useAutenticacion";
import logo from "../assets/logo.png";

export default function Encabezado() {
  const { usuario, cerrarSesion } = useAutenticacion();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/panel" className="shrink-0">
          <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
        </Link>

        {usuario && (
          <div className="flex items-center gap-1 sm:gap-2 text-sm min-w-0">
            <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none mr-1 sm:mr-3 whitespace-nowrap">
              <Link to="/panel" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                Inicio
              </Link>
              <Link to="/servicios" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                Servicios
              </Link>
              {usuario.rol !== "cliente" && (
                <>
                  <Link to="/turnos" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    Turnos
                  </Link>
                  <Link to="/horarios" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    Horarios
                  </Link>
                  <Link to="/empleados" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    Empleados
                  </Link>
                  <Link to="/estadisticas" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    Estadísticas
                  </Link>
                </>
              )}
              {usuario.rol === "cliente" && (
                <Link to="/mis-turnos" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  Mis Turnos
                </Link>
              )}
              <Link to="/fidelizacion" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                Fidelización
              </Link>
              <Link to="/perfil" className="shrink-0 px-2.5 sm:px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                Perfil
              </Link>
            </nav>
            <span className="hidden sm:inline text-stone-500 dark:text-stone-400 whitespace-nowrap">{usuario.nombre}</span>
            <button
              type="button"
              onClick={cerrarSesion}
              className="shrink-0 px-2 py-2 rounded-lg text-stone-400 dark:text-stone-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
