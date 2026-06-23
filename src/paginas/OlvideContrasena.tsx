import { useState } from "react";
import { Link } from "react-router-dom";

export default function OlvideContrasena() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/autenticacion/olvide-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const datos = await res.json();
      if (!res.ok) throw datos;
      setEnviado(true);
    } catch (err: unknown) {
      const e = err as { mensaje?: string };
      setError(e.mensaje ?? "Error al procesar solicitud");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4 bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50 dark:from-stone-900 dark:via-stone-800 dark:to-amber-950">
      <div className="w-full max-w-md border border-stone-200/60 dark:border-stone-700/60 rounded-2xl bg-white/90 dark:bg-stone-900/90 shadow-xl p-7 sm:p-9">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Recuperar Contraseña</h1>
            <p className="text-xs text-stone-400 dark:text-stone-500">Te enviaremos un enlace</p>
          </div>
        </div>

        {enviado ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300">Si el email está registrado, recibirás un enlace para restablecer tu contraseña.</p>
            <Link to="/iniciar-sesion" className="mt-6 inline-block text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-rose-500 transition-colors">Volver a Inicio de Sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 text-sm text-red-700">{error}</div>}
            <div>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-[16px] sm:text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors" placeholder="tu@email.com" />
            </div>
            <button type="submit" disabled={cargando} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm transition-all">
              {cargando ? "Enviando…" : "Enviar enlace"}
            </button>
            <p className="text-center text-xs text-stone-400 dark:text-stone-500">
              <Link to="/iniciar-sesion" className="font-bold text-amber-600 dark:text-amber-400 hover:text-rose-500 transition-colors">Volver a Inicio de Sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
