import { useState, useCallback } from "react";
import { useTurnos } from "../hooks/useTurnos";
import ListaTurnos from "../componentes/ListaTurnos";
import FormularioTurno from "../componentes/FormularioTurno";
import type { Turno } from "../tipos";

export default function MisTurnos() {
  const { turnos, cargando, error: errorCarga, recargar } = useTurnos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleChangeEstado = useCallback(async (id: number, estado: Turno["estado"]) => {
    // Los clientes solo ven sus turnos, no pueden cambiar estado
    void id; void estado;
  }, []);

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
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Mis Turnos</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Tus turnos agendados.</p>
        </div>
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2.5 text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Turno
          </button>
        )}
      </div>

      {errorCarga && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{errorCarga}</div>
      )}

      {mostrarFormulario ? (
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Reservar Turno</h2>
          <FormularioTurno
            onTurnoCreado={() => { setMostrarFormulario(false); recargar(); }}
          />
        </div>
      ) : (
        <ListaTurnos
          turnos={turnos}
          esAdmin={false}
          onChangeEstado={handleChangeEstado}
        />
      )}
    </div>
  );
}
