import type { Servicio } from "../tipos";

interface Props {
  servicio: Servicio;
  esAdmin: boolean;
  onEditar: (servicio: Servicio) => void;
  onEliminar: (id: number) => void;
  onToggleActivo: (id: number, activo: boolean) => void;
}

export default function TarjetaServicio({ servicio, esAdmin, onEditar, onEliminar, onToggleActivo }: Props) {
  return (
    <div className={`rounded-xl border p-5 transition-all ${servicio.activo ? "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900" : "border-stone-200/50 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-800/50 opacity-70"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold truncate ${servicio.activo ? "text-stone-800 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`}>
              {servicio.nombre}
            </h3>
            {!servicio.activo && (
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">Inactivo</span>
            )}
          </div>
          {servicio.descripcion && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 line-clamp-2">{servicio.descripcion}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {servicio.duracion_minutos} min
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12M14 4C11 4 8 6 8 10c0 4 3 6 6 6 2 0 4-1 4-3"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
              {Number(servicio.precio).toLocaleString("es-PY")}
            </span>
          </div>
        </div>

        {esAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleActivo(servicio.id, !servicio.activo)}
              className={`p-2.5 sm:p-2 rounded-lg transition-colors ${servicio.activo ? "text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"}`}
              title={servicio.activo ? "Desactivar" : "Activar"}
            >
              {servicio.activo ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M10.7 2C10.7 2 14 5 14 11.5S10.7 21 10.7 21"/><path d="M6.7 5C6.7 5 9 8 9 11.5S6.7 18 6.7 18"/><path d="M14.7 5C14.7 5 17 8 17 11.5S14.7 18 14.7 18"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><polygon points="11 5 6 9 2 8 14 2 18 6 15.5 9.5 11 5"/><line x1="1" y1="21" x2="23" y2="3"/></svg>
              )}
            </button>
            <button
              onClick={() => onEditar(servicio)}
              className="p-2.5 sm:p-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button
              onClick={() => onEliminar(servicio.id)}
              className="p-2.5 sm:p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
