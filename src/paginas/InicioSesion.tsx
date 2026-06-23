import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../hooks/useAutenticacion";
import logo from "../assets/logo.png";

export default function InicioSesion() {
  const navigate = useNavigate();
  const { iniciarSesion, cargando } = useAutenticacion();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErroresCampo({});

    try {
      await iniciarSesion({ email, contrasena });
      navigate("/panel");
    } catch (err: unknown) {
      const errorApi = err as { errores?: { campo: string; mensaje: string }[]; mensaje?: string };
      if (errorApi.errores) {
        const mapa: Record<string, string> = {};
        for (const e of errorApi.errores) {
          mapa[e.campo] = e.mensaje;
        }
        setErroresCampo(mapa);
      } else {
        setError(errorApi.mensaje ?? "Error al iniciar sesión");
      }
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50 dark:from-stone-900 dark:via-stone-800 dark:to-amber-950">
      <div className="w-full max-w-md border border-stone-200/60 dark:border-stone-700/60 rounded-2xl bg-white/90 dark:bg-stone-900/90 shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 backdrop-blur-sm p-7 sm:p-9">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4">Acceso Seguro</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-[16px] sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
              placeholder="tu@email.com"
            />
            {erroresCampo.email && (
              <p className="mt-1 text-xs text-red-500">{erroresCampo.email}</p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="contrasena" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-[16px] sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
              placeholder="••••••••"
            />
            {erroresCampo.contrasena && (
              <p className="mt-1 text-xs text-red-500">{erroresCampo.contrasena}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            {cargando ? "Iniciando sesión…" : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
          ¿No tienes cuenta?{" "}
          <Link to="/registrarse" className="font-bold text-amber-600 dark:text-amber-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            Crear cuenta
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
          <Link to="/olvide-contrasena" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>

      <button
        type="button"
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-sm"
        aria-label="Cambiar tema"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="block dark:hidden">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden dark:block">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
    </div>
  );
}
