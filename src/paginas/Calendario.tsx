import { useState, useCallback } from "react";
import { useAutenticacion } from "../hooks/useAutenticacion";
import { useTurnos } from "../hooks/useTurnos";
import CalendarioTurnos from "../componentes/CalendarioTurnos";
import ListaTurnos from "../componentes/ListaTurnos";
import * as turnoApi from "../api/turno-api";
import type { Turno } from "../tipos";

export default function Calendario() {
  const { usuario } = useAutenticacion();
  const esAdmin = usuario?.rol === "admin" || usuario?.rol === "empleado";
  const { turnos, cargando, error: errorCarga, recargar } = useTurnos();
  const [vista, setVista] = useState<"calendario" | "lista">("calendario");
  const [error, setError] = useState<string | null>(null);

  const handleChangeEstado = useCallback(async (id: number, estado: Turno["estado"]) => {
    try {
      await turnoApi.cambiarEstadoTurno(id, estado);
      recargar();
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al cambiar estado");
    }
  }, [recargar]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Turnos</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Vista mensual de todos los turnos.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setVista("calendario")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              vista === "calendario"
                ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
            }`}
          >
            Calendario
          </button>
          <button
            type="button"
            onClick={() => setVista("lista")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              vista === "lista"
                ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {errorCarga && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{errorCarga}</div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      {vista === "calendario" ? (
        <CalendarioTurnos
          turnos={turnos}
        />
      ) : (
        <ListaTurnos
          turnos={turnos}
          esAdmin={esAdmin}
          onChangeEstado={handleChangeEstado}
        />
      )}
    </div>
  );
}
