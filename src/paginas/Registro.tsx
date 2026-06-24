import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../hooks/useAutenticacion";

export default function Registro() {
  const navigate = useNavigate();
  const { registrarse, cargando } = useAutenticacion();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErroresCampo({});

    try {
      await registrarse({ nombre, email, telefono, contrasena });
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
        setError(errorApi.mensaje ?? "Error al registrarse");
      }
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50 dark:from-stone-900 dark:via-stone-800 dark:to-amber-950">
      <div className="w-full max-w-md border border-stone-200/60 dark:border-stone-700/60 rounded-2xl bg-white/90 dark:bg-stone-900/90 shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 backdrop-blur-sm p-7 sm:p-9">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white text-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 14.6L14.6 20.8C14 21.4 13 21.4 12.4 20.8L3.2 11.6C2.9 11.3 2.8 10.9 2.8 10.5L2.8 4.5C2.8 3.7 3.5 3 4.3 3L10.3 3C10.7 3 11.1 3.1 11.4 3.4L20.6 12.6C21.2 13.2 21.2 14 20.8 14.6Z" />
              <circle cx="6.5" cy="6.5" r="1.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight">Peluquería</h1>
            <p className="text-xs text-stone-400 dark:text-stone-500">Crear Cuenta</p>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4">Regístrate Gratis</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-[16px] sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
              placeholder="Tu nombre"
            />
            {erroresCampo.nombre && (
              <p className="mt-1 text-xs text-red-500">{erroresCampo.nombre}</p>
            )}
          </div>

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

          <div className="mb-4">
            <label htmlFor="telefono" className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-[16px] sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-500/20 transition-colors"
              placeholder="123456789"
            />
            {erroresCampo.telefono && (
              <p className="mt-1 text-xs text-red-500">{erroresCampo.telefono}</p>
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
              placeholder="Mínimo 6 caracteres"
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
            {cargando ? "Creando cuenta…" : "Crear Cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/iniciar-sesion" className="font-bold text-amber-600 dark:text-amber-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            Iniciar Sesión
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
