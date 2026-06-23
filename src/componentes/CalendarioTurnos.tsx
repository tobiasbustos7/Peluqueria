import { useState, useMemo } from "react";
import type { Turno } from "../tipos";

interface Props {
  turnos: Turno[];
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const COLORES_ESTADO_BG: Record<Turno["estado"], string> = {
  pendiente: "border-l-amber-400 bg-amber-50 dark:bg-amber-950/20",
  confirmado: "border-l-blue-400 bg-blue-50 dark:bg-blue-950/20",
  cancelado: "border-l-red-400 bg-red-50 dark:bg-red-950/20 opacity-60",
  completado: "border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
};

export default function CalendarioTurnos({ turnos }: Props) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anoActual, setAnoActual] = useState(hoy.getFullYear());

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(anoActual, mesActual, 1);
    const ultimoDia = new Date(anoActual, mesActual + 1, 0);
    const dias: { fecha: string; dia: number; fuera: boolean }[] = [];

    const diaSemanaInicio = primerDia.getDay();
    for (let i = 0; i < diaSemanaInicio; i++) {
      const fecha = new Date(anoActual, mesActual, -diaSemanaInicio + i + 1);
      dias.push({ fecha: fecha.toISOString().split("T")[0], dia: fecha.getDate(), fuera: true });
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(anoActual, mesActual, d);
      dias.push({ fecha: fecha.toISOString().split("T")[0], dia: d, fuera: false });
    }

    const resto = 42 - dias.length;
    for (let i = 1; i <= resto; i++) {
      const fecha = new Date(anoActual, mesActual + 1, i);
      dias.push({ fecha: fecha.toISOString().split("T")[0], dia: fecha.getDate(), fuera: true });
    }

    return dias;
  }, [mesActual, anoActual]);

  const turnosPorFecha = useMemo(() => {
    const mapa: Record<string, Turno[]> = {};
    for (const t of turnos) {
      if (!mapa[t.fecha]) mapa[t.fecha] = [];
      mapa[t.fecha].push(t);
    }
    return mapa;
  }, [turnos]);

  function cambiarMes(delta: number) {
    const nuevaFecha = new Date(anoActual, mesActual + delta, 1);
    setMesActual(nuevaFecha.getMonth());
    setAnoActual(nuevaFecha.getFullYear());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => cambiarMes(-1)}
          className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          {new Date(anoActual, mesActual).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          onClick={() => cambiarMes(1)}
          className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-stone-200 dark:bg-stone-700 rounded-xl overflow-hidden">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="bg-stone-100 dark:bg-stone-800 px-1 sm:px-2 py-2 text-center text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
        {diasDelMes.map((d, i) => {
          const turnosDelDia = turnosPorFecha[d.fecha] ?? [];
          return (
            <div
              key={i}
              className={`min-h-[60px] sm:min-h-[80px] bg-white dark:bg-stone-900 p-1 sm:p-1.5 transition-colors ${
                d.fuera ? "opacity-40" : ""
              }`}
            >
              <span className={`text-[10px] sm:text-xs font-bold ${d.fuera ? "text-stone-300 dark:text-stone-600" : "text-stone-500 dark:text-stone-400"}`}>
                {d.dia}
              </span>
              <div className="mt-0.5 sm:mt-1 space-y-0.5">
                {turnosDelDia.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className={`text-[8px] sm:text-[10px] leading-tight px-0.5 sm:px-1 py-0.5 rounded border-l-2 truncate ${COLORES_ESTADO_BG[t.estado]}`}
                  >
                    {t.hora_inicio.slice(0, 5)}
                  </div>
                ))}
                {turnosDelDia.length > 3 && (
                  <div className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500 px-0.5 sm:px-1">
                    +{turnosDelDia.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
