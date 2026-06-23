import { useState, useEffect, useCallback } from "react";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { Horario } from "../tipos";

interface HorarioConEmpleado extends Horario {
  empleado_nombre: string;
}

const API_BASE = "/api";

function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  return fetch(`${API_BASE}${ruta}`, { headers: cabeceras, ...opciones })
    .then((r) => r.json())
    .then((d) => d as T);
}

const DIAS = [
  { valor: 0, etiqueta: "Domingo" },
  { valor: 1, etiqueta: "Lunes" },
  { valor: 2, etiqueta: "Martes" },
  { valor: 3, etiqueta: "Miércoles" },
  { valor: 4, etiqueta: "Jueves" },
  { valor: 5, etiqueta: "Viernes" },
  { valor: 6, etiqueta: "Sábado" },
];

interface FilaHorario {
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
}

export default function Horarios() {
  const { usuario } = useAutenticacion();
  const esAdmin = usuario?.rol === "admin";

  const [empleados, setEmpleados] = useState<{ id: number; nombre: string }[]>([]);
  const [empleadoId, setEmpleadoId] = useState<number>(1);
  const [horarios, setHorarios] = useState<HorarioConEmpleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const cargarEmpleados = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/empleados", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setEmpleados(await res.json());
  }, []);

  const cargarHorarios = useCallback(async (eid: number) => {
    setCargando(true);
    try {
      const datos = await peticion<HorarioConEmpleado[]>(`/horarios?empleado_id=${eid}`);
      setHorarios(datos);
    } catch {
      // ignore
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarEmpleados();
  }, [cargarEmpleados]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarHorarios(empleadoId);
  }, [empleadoId, cargarHorarios]);

  const horarioExistente = (dia: number) =>
    horarios.find((h) => h.dia_semana === dia);

  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState<FilaHorario[]>(
    DIAS.map((d) => ({
      dia_semana: d.valor,
      hora_apertura: "09:00",
      hora_cierre: "18:00",
      activo: d.valor === 0 || d.valor === 6 ? false : true,
    })),
  );

  function iniciarEdicion() {
    const filas: FilaHorario[] = DIAS.map((d) => {
      const existente = horarioExistente(d.valor);
      return {
        dia_semana: d.valor,
        hora_apertura: existente?.hora_apertura ?? "09:00",
        hora_cierre: existente?.hora_cierre ?? "18:00",
        activo: existente?.activo ?? (d.valor === 0 || d.valor === 6 ? false : true),
      };
    });
    setFormulario(filas);
    setEditando(true);
  }

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    setExito(null);
    try {
      const actualizados = await peticion<HorarioConEmpleado[]>("/horarios", {
        method: "PUT",
        body: JSON.stringify({
          empleado_id: empleadoId,
          horarios: formulario.filter((f) => f.activo),
        }),
      });
      setHorarios(actualizados);
      setEditando(false);
      setExito("Horarios actualizados correctamente");
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al guardar horarios");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Horarios</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Configurá los horarios de atención por empleado.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}
      {exito && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300">{exito}</div>
      )}

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-bold text-stone-700 dark:text-stone-300">Empleado:</label>
          <select
            value={empleadoId}
            onChange={(e) => { setEmpleadoId(Number(e.target.value)); setEditando(false); }}
            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400"
          >
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          {esAdmin && !editando && (
            <button
              type="button"
              onClick={iniciarEdicion}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2 text-sm transition-all"
            >
              Editar Horarios
            </button>
          )}
        </div>

        {cargando ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {DIAS.map((dia) => {
              const existente = horarioExistente(dia.valor);
              const editandoDia = editando ? formulario.find((f) => f.dia_semana === dia.valor) : null;

              return (
                <div
                  key={dia.valor}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    existente?.activo
                      ? "bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700"
                      : "bg-stone-50/50 dark:bg-stone-800/20 border border-stone-200/50 dark:border-stone-700/50"
                  }`}
                >
                  <div className="w-24 shrink-0">
                    <span className={`text-sm font-bold ${existente?.activo ? "text-stone-800 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`}>
                      {dia.etiqueta}
                    </span>
                  </div>

                    {editando ? (
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editandoDia?.activo ?? false}
                          onChange={() => {
                            setFormulario((prev) =>
                              prev.map((f) =>
                                f.dia_semana === dia.valor ? { ...f, activo: !f.activo } : f,
                              ),
                            );
                          }}
                          className="rounded border-stone-300 dark:border-stone-600 text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-xs text-stone-500 dark:text-stone-400">Activo</span>
                      </label>
                      {editandoDia?.activo && (
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <input
                            type="time"
                            value={editandoDia.hora_apertura}
                            onChange={(e) => {
                              setFormulario((prev) =>
                                prev.map((f) =>
                                  f.dia_semana === dia.valor ? { ...f, hora_apertura: e.target.value } : f,
                                ),
                              );
                            }}
                            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 w-[120px] sm:w-auto"
                          />
                          <span className="text-xs text-stone-500 dark:text-stone-400">a</span>
                          <input
                            type="time"
                            value={editandoDia.hora_cierre}
                            onChange={(e) => {
                              setFormulario((prev) =>
                                prev.map((f) =>
                                  f.dia_semana === dia.valor ? { ...f, hora_cierre: e.target.value } : f,
                                ),
                              );
                            }}
                            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 w-[120px] sm:w-auto"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1">
                      {existente?.activo ? (
                        <span className="text-sm text-stone-600 dark:text-stone-300">
                          {existente.hora_apertura.slice(0, 5)} - {existente.hora_cierre.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-sm text-stone-400 dark:text-stone-500 italic">No atiende</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {editando && (
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="px-6 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold text-sm transition-all"
                >
                  {guardando ? "Guardando…" : "Guardar Horarios"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
