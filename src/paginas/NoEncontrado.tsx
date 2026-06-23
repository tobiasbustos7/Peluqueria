import { Link } from "react-router-dom";

export default function NoEncontrado() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50 dark:from-stone-900 dark:via-stone-800 dark:to-amber-950">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-amber-300 dark:text-amber-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Página no encontrada</h1>
        <p className="text-stone-500 dark:text-stone-400 mb-8">La página que buscas no existe o fue movida.</p>
        <Link
          to="/panel"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold px-6 py-3 text-sm shadow-lg shadow-amber-200/50 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
