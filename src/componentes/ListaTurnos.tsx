import type { Turno } from "../tipos";

interface Props {
  turnos: Turno[];
  esAdmin: boolean;
  onChangeEstado: (id: number, estado: Turno["estado"]) => void;
}

const ETIQUETAS_ESTADO: Record<Turno["estado"], string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  completado: "Completado",
};

const COLORES_ESTADO: Record<Turno["estado"], string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  completado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function ListaTurnos({ turnos, esAdmin, onChangeEstado }: Props) {
  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
        No hay turnos registrados
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {turnos.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${COLORES_ESTADO[t.estado]}`}>
                  {ETIQUETAS_ESTADO[t.estado]}
                </span>
                <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  {(t as unknown as Record<string, string>).servicio_nombre ?? `Servicio #${t.servicio_id}`}
                </span>
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 space-y-0.5">
                <p>{(t as unknown as Record<string, string>).cliente_nombre ?? `Cliente #${t.cliente_id}`}</p>
                <p>{(t as unknown as Record<string, string>).empleado_nombre ?? `Empleado #${t.empleado_id}`}</p>
                <p>
                  {new Date(t.fecha + "T12:00:00").toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {t.hora_inicio} - {t.hora_fin}
                </p>
              </div>
            </div>

            {esAdmin && t.estado !== "cancelado" && t.estado !== "completado" && (
              <div className="flex items-center gap-1 shrink-0">
                {t.estado === "pendiente" && (
                  <button
                    onClick={() => onChangeEstado(t.id, "confirmado")}
                    className="p-2.5 sm:p-2 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title="Confirmar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </button>
                )}
                {t.estado === "confirmado" && (
                  <button
                    onClick={() => onChangeEstado(t.id, "completado")}
                    className="p-2.5 sm:p-2 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    title="Completar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                )}
                <button
                  onClick={() => onChangeEstado(t.id, "cancelado")}
                  className="p-2.5 sm:p-2 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Cancelar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
