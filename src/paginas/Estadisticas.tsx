import { useState, useEffect } from "react";
import * as estadisticaApi from "../api/estadistica-api";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Estadisticas() {
  const [resumen, setResumen] = useState<estadisticaApi.ResumenDashboard | null>(null);
  const [populares, setPopulares] = useState<estadisticaApi.ServicioPopular[]>([]);
  const [ingresos, setIngresos] = useState<estadisticaApi.IngresoPorMes[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [r, p, i] = await Promise.all([
          estadisticaApi.obtenerResumen(),
          estadisticaApi.obtenerServiciosPopulares(),
          estadisticaApi.obtenerIngresosPorMes(),
        ]);
        setResumen(r);
        setPopulares(p);
        setIngresos(i);
      } catch {
        // ignore
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxIngreso = Math.max(...ingresos.map((i) => i.total_ingresos), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Estadísticas</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Reportes y métricas del negocio.</p>
      </div>

      {resumen && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Turnos hoy", value: resumen.turnos_hoy, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
            { label: "Pendientes", value: resumen.turnos_pendientes, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
            { label: "Servicios", value: resumen.servicios_activos, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
            { label: "Empleados", value: resumen.empleados_activos, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
            { label: "Clientes", value: resumen.clientes_registrados, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600" },
            { label: "Ingresos 30d", value: `₲${Number(resumen.ingresos_mes).toLocaleString("es-PY")}`, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 shadow-sm">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.color.split(" ").pop()}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Ingresos por mes</h2>
          {ingresos.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">No hay datos de ingresos aún.</p>
          ) : (
            <div className="space-y-3">
              {ingresos.map((i) => (
                <div key={i.mes}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-700 dark:text-stone-300 font-medium">{MESES[i.mes - 1]}</span>
                    <span className="text-stone-500 dark:text-stone-400">₲{Number(i.total_ingresos).toLocaleString("es-PY")} ({i.total_turnos} turnos)</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all" style={{ width: `${(i.total_ingresos / maxIngreso) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Servicios más reservados</h2>
          {populares.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">No hay datos de reservas aún.</p>
          ) : (
            <div className="space-y-3">
              {populares.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{s.nombre}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{s.total_reservas} reservas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
