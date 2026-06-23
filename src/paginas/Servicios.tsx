import { useState, useEffect, useCallback } from "react";
import * as servicioApi from "../api/servicio-api";
import { useAutenticacion } from "../hooks/useAutenticacion";
import TarjetaServicio from "../componentes/TarjetaServicio";
import type { Servicio } from "../tipos";

interface FormularioServicio {
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
}

const FORMULARIO_VACIO: FormularioServicio = {
  nombre: "",
  descripcion: "",
  duracion_minutos: 30,
  precio: 0,
};

export default function Servicios() {
  const { usuario } = useAutenticacion();
  const esAdmin = usuario?.rol === "admin" || usuario?.rol === "empleado";

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [formulario, setFormulario] = useState<FormularioServicio>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

  const cargarServicios = useCallback(async () => {
    try {
      setCargando(true);
      const datos = await servicioApi.listarServicios();
      setServicios(datos);
    } catch (err: unknown) {
      const errorApi = err as { mensaje?: string };
      setError(errorApi.mensaje ?? "Error al cargar servicios");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarServicios();
  }, [cargarServicios]);

  function abrirModal(servicio?: Servicio) {
    if (servicio) {
      setEditando(servicio);
      setFormulario({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion ?? "",
        duracion_minutos: servicio.duracion_minutos,
        precio: servicio.precio,
      });
    } else {
      setEditando(null);
      setFormulario(FORMULARIO_VACIO);
    }
    setErroresCampo({});
    setModalAbierto(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErroresCampo({});

    try {
      if (editando) {
        const actualizado = await servicioApi.actualizarServicio(editando.id, formulario);
        setServicios(prev => prev.map(s => s.id === actualizado.id ? actualizado : s));
      } else {
        const creado = await servicioApi.crearServicio(formulario);
        setServicios(prev => [...prev, creado]);
      }
      setModalAbierto(false);
    } catch (err: unknown) {
      const errorApi = err as { errores?: { campo: string; mensaje: string }[]; mensaje?: string };
      if (errorApi.errores) {
        const mapa: Record<string, string> = {};
        for (const e of errorApi.errores) mapa[e.campo] = e.mensaje;
        setErroresCampo(mapa);
      } else {
        setError(errorApi.mensaje ?? "Error al guardar servicio");
      }
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await servicioApi.eliminarServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err: unknown) {
      const errorApi = err as { mensaje?: string };
      setError(errorApi.mensaje ?? "Error al eliminar servicio");
    }
  }

  async function handleToggleActivo(id: number, activo: boolean) {
    try {
      const actualizado = await servicioApi.actualizarServicio(id, { activo });
      setServicios(prev => prev.map(s => s.id === actualizado.id ? actualizado : s));
    } catch (err: unknown) {
      const errorApi = err as { mensaje?: string };
      setError(errorApi.mensaje ?? "Error al cambiar estado");
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Servicios</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Gestioná los servicios que ofrecés.</p>
        </div>
        {esAdmin && (
          <button
            onClick={() => abrirModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2.5 text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Servicio
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {servicios.length === 0 ? (
        <div className="text-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto text-stone-300 dark:text-stone-600 mb-4">
            <path d="M20.8 14.6L14.6 20.8C14 21.4 13 21.4 12.4 20.8L3.2 11.6C2.9 11.3 2.8 10.9 2.8 10.5L2.8 4.5C2.8 3.7 3.5 3 4.3 3L10.3 3C10.7 3 11.1 3.1 11.4 3.4L20.6 12.6C21.2 13.2 21.2 14 20.8 14.6Z" />
          </svg>
          <p className="text-stone-400 dark:text-stone-500 text-sm">No hay servicios registrados</p>
          {esAdmin && (
            <button onClick={() => abrirModal()} className="mt-4 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
              + Crear primer servicio
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map(s => (
            <TarjetaServicio
              key={s.id}
              servicio={s}
              esAdmin={esAdmin}
              onEditar={abrirModal}
              onEliminar={handleEliminar}
              onToggleActivo={handleToggleActivo}
            />
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative w-full max-w-lg border border-stone-200/60 dark:border-stone-700/60 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl p-5 sm:p-7">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6">
              {editando ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
                  placeholder="Corte de cabello"
                />
                {erroresCampo.nombre && <p className="mt-1 text-xs text-red-500">{erroresCampo.nombre}</p>}
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors resize-none"
                  placeholder="Descripción del servicio..."
                />
                {erroresCampo.descripcion && <p className="mt-1 text-xs text-red-500">{erroresCampo.descripcion}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duracion" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Duración (min)
                  </label>
                  <input
                    id="duracion"
                    type="number"
                    min={5}
                    max={480}
                    value={formulario.duracion_minutos}
                    onChange={(e) => setFormulario(prev => ({ ...prev, duracion_minutos: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
                  />
                  {erroresCampo.duracion_minutos && <p className="mt-1 text-xs text-red-500">{erroresCampo.duracion_minutos}</p>}
                </div>
                <div>
                  <label htmlFor="precio" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Precio (₲)
                  </label>
                  <input
                    id="precio"
                    type="number"
                    min={0}
                    value={formulario.precio}
                    onChange={(e) => setFormulario(prev => ({ ...prev, precio: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
                  />
                  {erroresCampo.precio && <p className="mt-1 text-xs text-red-500">{erroresCampo.precio}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="w-full sm:flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all active:scale-[0.98]"
                >
                  {guardando ? "Guardando…" : editando ? "Guardar Cambios" : "Crear Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
