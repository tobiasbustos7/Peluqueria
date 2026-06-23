import { useState } from "react";
import { useAutenticacion } from "../hooks/useAutenticacion";

export default function Perfil() {
  const { usuario, actualizarDatos } = useAutenticacion();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [errorPass, setErrorPass] = useState<string | null>(null);
  const [exitoPass, setExitoPass] = useState<string | null>(null);

  async function handleGuardarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/autenticacion/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, telefono }),
      });
      const datos = await res.json();
      if (!res.ok) throw datos;
      if (actualizarDatos) actualizarDatos({ nombre, telefono });
      setExito("Perfil actualizado correctamente");
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al actualizar perfil");
    } finally {
      setGuardando(false);
    }
  }

  async function handleCambiarContrasena(e: React.FormEvent) {
    e.preventDefault();
    if (!contrasenaNueva || contrasenaNueva.length < 6) {
      setErrorPass("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    setGuardandoPass(true);
    setErrorPass(null);
    setExitoPass(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/autenticacion/cambiar-contrasena", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contrasena_actual: contrasenaActual, contrasena_nueva: contrasenaNueva }),
      });
      const datos = await res.json();
      if (!res.ok) throw datos;
      setExitoPass("Contraseña actualizada correctamente");
      setContrasenaActual("");
      setContrasenaNueva("");
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setErrorPass(e.mensaje ?? "Error al cambiar contraseña");
    } finally {
      setGuardandoPass(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight mb-8">Mi Perfil</h1>

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 mb-6">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Datos personales</h2>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 text-sm text-red-700">{error}</div>}
        {exito && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-sm text-emerald-700">{exito}</div>}

        <form onSubmit={handleGuardarPerfil} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
            <input type="email" value={usuario?.email ?? ""} disabled className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-400 dark:text-stone-500 cursor-not-allowed" />
            <p className="mt-1 text-xs text-stone-400">El email no puede modificarse.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" />
          </div>
          <button type="submit" disabled={guardando} className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm transition-all">
            {guardando ? "Guardando…" : "Guardar Cambios"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Cambiar contraseña</h2>

        {errorPass && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 text-sm text-red-700">{errorPass}</div>}
        {exitoPass && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-sm text-emerald-700">{exitoPass}</div>}

        <form onSubmit={handleCambiarContrasena} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Contraseña actual</label>
            <input type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} required className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Nueva contraseña</label>
            <input type="password" value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)} required minLength={6} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="Mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={guardandoPass} className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm transition-all">
            {guardandoPass ? "Cambiando…" : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
