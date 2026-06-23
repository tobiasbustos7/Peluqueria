import { useState, useEffect } from "react";
import { useAutenticacion } from "../hooks/useAutenticacion";
import * as empleadoApi from "../api/empleado-api";
import type { Empleado } from "../api/empleado-api";

interface FormEmpleado {
  nombre: string;
  email: string;
  telefono: string;
  contrasena: string;
  rol: "admin" | "empleado";
}

const EMPTY_FORM: FormEmpleado = { nombre: "", email: "", telefono: "", contrasena: "", rol: "empleado" };

export default function Empleados() {
  const { usuario } = useAutenticacion();
  const esAdmin = usuario?.rol === "admin";

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState<FormEmpleado>(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      setCargando(true);
      setEmpleados(await empleadoApi.listarEmpleados());
    } catch {
      setError("Error al cargar empleados");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  function abrirModal(emp?: Empleado) {
    if (emp) {
      setEditando(emp);
      setForm({ nombre: emp.nombre, email: emp.email, telefono: emp.telefono ?? "", contrasena: "", rol: emp.rol });
    } else {
      setEditando(null);
      setForm(EMPTY_FORM);
    }
    setModalAbierto(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editando) {
        const data: Record<string, unknown> = { nombre: form.nombre, email: form.email, telefono: form.telefono, rol: form.rol };
        if (form.contrasena) data.contrasena = form.contrasena;
        await empleadoApi.actualizarEmpleado(editando.id, data);
      } else {
        await empleadoApi.crearEmpleado(form);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleActivo(emp: Empleado) {
    try {
      await empleadoApi.actualizarEmpleado(emp.id, { activo: !emp.activo });
      await cargar();
    } catch {
      setError("Error al cambiar estado");
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Eliminar este empleado?")) return;
    try {
      await empleadoApi.eliminarEmpleado(id);
      await cargar();
    } catch {
      setError("Error al eliminar empleado");
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
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Empleados</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Gestioná el personal de la peluquería.</p>
        </div>
        {esAdmin && (
          <button
            onClick={() => abrirModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-5 py-2.5 text-sm shadow-lg shadow-amber-200/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Empleado
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <th className="text-left px-4 py-3 font-bold text-stone-600 dark:text-stone-300">Nombre</th>
              <th className="text-left px-4 py-3 font-bold text-stone-600 dark:text-stone-300 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-bold text-stone-600 dark:text-stone-300 hidden md:table-cell">Teléfono</th>
              <th className="text-left px-4 py-3 font-bold text-stone-600 dark:text-stone-300">Rol</th>
              <th className="text-left px-4 py-3 font-bold text-stone-600 dark:text-stone-300">Estado</th>
              {esAdmin && <th className="text-right px-4 py-3 font-bold text-stone-600 dark:text-stone-300">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {empleados.map((emp) => (
              <tr key={emp.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-100">{emp.nombre}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 hidden sm:table-cell">{emp.email}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 hidden md:table-cell">{emp.telefono ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${emp.rol === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                    {emp.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${emp.activo ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"}`}>
                    {emp.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                {esAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleActivo(emp)} className={`p-2 rounded-lg transition-colors ${emp.activo ? "text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"}`} title={emp.activo ? "Desactivar" : "Activar"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{emp.activo ? <><path d="M10.7 2C10.7 2 14 5 14 11.5S10.7 21 10.7 21"/><path d="M6.7 5C6.7 5 9 8 9 11.5S6.7 18 6.7 18"/><path d="M14.7 5C14.7 5 17 8 17 11.5S14.7 18 14.7 18"/></> : <><polygon points="11 5 6 9 2 8 14 2 18 6 15.5 9.5 11 5"/><line x1="1" y1="21" x2="23" y2="3"/></>}</svg>
                      </button>
                      <button onClick={() => abrirModal(emp)} className="p-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                      </button>
                      <button onClick={() => handleEliminar(emp.id)} className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative w-full max-w-lg border border-stone-200/60 dark:border-stone-700/60 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl p-5 sm:p-7">
            <button onClick={() => setModalAbierto(false)} className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6">
              {editando ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="Nombre del empleado" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="email@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Teléfono</label>
                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Contraseña {editando ? "(dejar vacío para mantener)" : ""}
                </label>
                <input type="password" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} required={!editando} minLength={6} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "empleado" })} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors">
                  <option value="empleado">Empleado</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="w-full sm:flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm shadow-lg shadow-amber-200/50 transition-all">
                  {guardando ? "Guardando…" : editando ? "Guardar Cambios" : "Crear Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
