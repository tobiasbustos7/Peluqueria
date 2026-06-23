import { useState, useEffect } from "react";
import * as servicioApi from "../api/servicio-api";
import * as empleadoApi from "../api/empleado-api";
import * as turnoApi from "../api/turno-api";
import type { Servicio } from "../tipos";
import type { Empleado } from "../api/empleado-api";
import type { SlotDisponible } from "../api/turno-api";

interface Props {
  onTurnoCreado: () => void;
}

type Paso = "servicio" | "empleado" | "fecha" | "horario" | "confirmar";

export default function FormularioTurno({ onTurnoCreado }: Props) {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [empleadoId, setEmpleadoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState<SlotDisponible | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    servicioApi.listarServicios(true).then(setServicios).catch(() => {});
    empleadoApi.listarEmpleados().then((todos) => {
      setEmpleados(todos.filter((e) => e.rol === "empleado" && e.activo));
    }).catch(() => {});
  }, []);

  async function handleBuscarSlots() {
    if (!servicioId || !empleadoId || !fecha) return;
    setCargandoSlots(true);
    setError(null);
    try {
      const disponibles = await turnoApi.obtenerDisponibilidad(servicioId, fecha, empleadoId);
      setSlots(disponibles);
      setSlotSeleccionado(null);
      setPaso("horario");
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al buscar disponibilidad");
    } finally {
      setCargandoSlots(false);
    }
  }

  async function handleConfirmar() {
    if (!servicioId || !slotSeleccionado || !fecha) return;

    const hoy = new Date();
    const hoyStr = hoy.toISOString().split("T")[0];

    if (fecha < hoyStr) {
      setError("No puedes agendar un turno en una fecha pasada");
      return;
    }

    if (fecha === hoyStr) {
      const [hSel, mSel] = slotSeleccionado.hora_inicio.split(":").map(Number);
      const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes();
      if (hSel * 60 + mSel <= ahoraMin) {
        setError("No puedes agendar un turno en un horario que ya pasó");
        return;
      }
    }

    setGuardando(true);
    setError(null);
    try {
      await turnoApi.crearTurno({
        servicio_id: servicioId,
        empleado_id: slotSeleccionado.empleado_id,
        fecha,
        hora_inicio: slotSeleccionado.hora_inicio,
        observaciones,
      });
      onTurnoCreado();
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al crear turno");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Paso 1: Seleccionar servicio */}
      {paso === "servicio" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            1. Seleccioná un servicio
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {servicios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setServicioId(s.id); setPaso("empleado"); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  servicioId === s.id
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-500"
                    : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-amber-600"
                }`}
              >
                <p className="font-bold text-stone-800 dark:text-stone-100 text-sm">{s.nombre}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {s.duracion_minutos} min · ₲{Number(s.precio).toLocaleString("es-PY")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: Seleccionar profesional */}
      {paso === "empleado" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            2. Elegí tu profesional
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {empleados.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { setEmpleadoId(e.id); setPaso("fecha"); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  empleadoId === e.id
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-500"
                    : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-amber-600"
                }`}
              >
                <p className="font-bold text-stone-800 dark:text-stone-100">{e.nombre}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaso("servicio")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Seleccionar fecha */}
      {paso === "fecha" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            3. Elegí la fecha
          </h3>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors"
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaso("empleado")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleBuscarSlots}
              disabled={!fecha || cargandoSlots}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm transition-all"
            >
              {cargandoSlots ? "Buscando…" : "Ver horarios disponibles"}
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: Seleccionar horario */}
      {paso === "horario" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            4. Elegí un horario
          </h3>
          {slots.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 py-4">
              No hay horarios disponibles para esta fecha.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3 max-h-64 overflow-y-auto">
              {slots.map((s, i) => (
                <button
                  key={`${s.empleado_id}-${s.hora_inicio}-${i}`}
                  type="button"
                  onClick={() => { setSlotSeleccionado(s); setPaso("confirmar"); }}
                  className="text-left p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-amber-600 transition-all"
                >
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {s.hora_inicio}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {s.empleado_nombre}
                  </p>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaso("fecha")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* Paso 5: Confirmar */}
      {paso === "confirmar" && slotSeleccionado && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            5. Confirmá tu turno
          </h3>
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 space-y-2 text-sm">
            <p className="text-stone-800 dark:text-stone-100">
              <span className="font-bold">Servicio:</span>{" "}
              {servicios.find((s) => s.id === servicioId)?.nombre ?? "—"}
            </p>
            <p className="text-stone-800 dark:text-stone-100">
              <span className="font-bold">Empleado:</span> {slotSeleccionado.empleado_nombre}
            </p>
            <p className="text-stone-800 dark:text-stone-100">
              <span className="font-bold">Fecha:</span>{" "}
              {new Date(fecha + "T12:00:00").toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-stone-800 dark:text-stone-100">
              <span className="font-bold">Horario:</span> {slotSeleccionado.hora_inicio} - {slotSeleccionado.hora_fin}
            </p>
            <div>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1">
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaso("horario")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={guardando}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm transition-all"
            >
              {guardando ? "Reservando…" : "Confirmar Turno"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
