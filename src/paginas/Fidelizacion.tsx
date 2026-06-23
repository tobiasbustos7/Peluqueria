import { useState, useEffect } from "react";
import { useAutenticacion } from "../hooks/useAutenticacion";
import * as fidelizacionApi from "../api/fidelizacion-api";

export default function Fidelizacion() {
  const { usuario } = useAutenticacion();
  const esAdmin = usuario?.rol === "admin";

  const [config, setConfig] = useState<fidelizacionApi.ConfigFidelizacion | null>(null);
  const [visitas, setVisitas] = useState<fidelizacionApi.VisitasCliente | null>(null);
  const [notificaciones, setNotificaciones] = useState<fidelizacionApi.Confignotificaciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState({ visitas_requeridas: 5, descripcion_beneficio: "" });
  const [editandoNotif, setEditandoNotif] = useState(false);
  const [formNotif, setFormNotif] = useState({ horas_antes: 24, activo: true });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        if (esAdmin) {
          const [c, n] = await Promise.all([
            fidelizacionApi.obtenerConfiguracion(),
            fidelizacionApi.obtenerNotificaciones(),
          ]);
          setConfig(c);
          setNotificaciones(n);
        } else {
          const v = await fidelizacionApi.obtenerMisVisitas();
          setVisitas(v);
        }
      } catch {
        setError("Error al cargar datos");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [esAdmin]);

  function iniciarEdicion() {
    setFormulario({
      visitas_requeridas: config?.visitas_requeridas ?? 5,
      descripcion_beneficio: config?.descripcion_beneficio ?? "",
    });
    setEditando(true);
    setError(null);
    setExito(null);
  }

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await fidelizacionApi.actualizarConfiguracion(formulario);
      setConfig(actualizado);
      setEditando(false);
      setExito("Configuración guardada correctamente");
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Fidelización</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {esAdmin ? "Configurá el programa de fidelización por visitas." : "Tu progreso en el programa de fidelización."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}
      {exito && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300">{exito}</div>
      )}

      {esAdmin ? (
        <><div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Configuración</h2>
            {!editando && (
              <button
                type="button"
                onClick={iniciarEdicion}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2 text-sm transition-all"
              >
                Editar
              </button>
            )}
          </div>

          {!editando && config ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-lg">
                  {config.visitas_requeridas}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100">Visitas requeridas</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Cantidad de visitas para obtener el beneficio</p>
                </div>
              </div>
              {config.descripcion_beneficio && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">Beneficio</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{config.descripcion_beneficio}</p>
                  </div>
                </div>
              )}
            </div>
          ) : editando ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Visitas requeridas</label>
                <input
                  type="number"
                  min="1"
                  value={formulario.visitas_requeridas}
                  onChange={(e) => setFormulario((prev) => ({ ...prev, visitas_requeridas: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Descripción del beneficio</label>
                <textarea
                  value={formulario.descripcion_beneficio}
                  onChange={(e) => setFormulario((prev) => ({ ...prev, descripcion_beneficio: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 resize-none"
                  placeholder="Ej: 20% de descuento en tu próximo servicio"
                />
              </div>
              <div className="flex justify-end gap-3">
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
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Recordatorios</h2>
            {!editandoNotif && (
              <button
                type="button"
                onClick={() => {
                  setFormNotif({
                    horas_antes: notificaciones?.horas_antes ?? 24,
                    activo: notificaciones?.activo ?? true,
                  });
                  setEditandoNotif(true);
                  setError(null);
                  setExito(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2 text-sm transition-all"
              >
                Editar
              </button>
            )}
          </div>

          {!editandoNotif && notificaciones ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {notificaciones.activo ? "Activado" : "Desactivado"}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Recordatorio enviado {notificaciones.horas_antes} horas antes del turno
                  </p>
                </div>
              </div>
            </div>
          ) : editandoNotif ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNotif.activo}
                    onChange={(e) => setFormNotif((prev) => ({ ...prev, activo: e.target.checked }))}
                    className="rounded border-stone-300 dark:border-stone-600 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300">Activar recordatorios</span>
                </label>
              </div>
              {formNotif.activo && (
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Horas de anticipación
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formNotif.horas_antes}
                    onChange={(e) => setFormNotif((prev) => ({ ...prev, horas_antes: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400"
                  />
                  <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Se enviará un recordatorio por correo electrónico</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditandoNotif(false)}
                  className="px-6 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setGuardando(true);
                    setError(null);
                    try {
                      const actualizado = await fidelizacionApi.actualizarNotificaciones(formNotif);
                      setNotificaciones(actualizado);
                      setEditandoNotif(false);
                      setExito("Configuración de recordatorios guardada");
                    } catch (err: unknown) {
                      const e = err as { mensaje?: string };
                      setError(e.mensaje ?? "Error al guardar");
                    } finally {
                      setGuardando(false);
                    }
                  }}
                  disabled={guardando}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold text-sm transition-all"
                >
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          ) : null}
        </div></>
      ) : visitas ? (
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Tu progreso</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {visitas.visitas_acumuladas} de {visitas.visitas_requeridas} visitas
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                style={{ width: `${visitas.progreso}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500 text-right">{visitas.progreso}% completado</p>
          </div>

          {visitas.beneficio_activo ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Felicitaciones</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">{visitas.descripcion_beneficio}</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Te faltan <strong className="text-stone-700 dark:text-stone-300">{visitas.visitas_requeridas - visitas.visitas_acumuladas}</strong> visitas para obtener:
              </p>
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300 mt-1">
                {visitas.descripcion_beneficio ?? "Beneficio no configurado"}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
