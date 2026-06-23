import type { ReactNode } from "react";

interface ModalConfirmarProps {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
  confirmando?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean;
}

export default function ModalConfirmar({
  abierto,
  titulo,
  children,
  onConfirmar,
  onCancelar,
  confirmando,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro,
}: ModalConfirmarProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl p-6">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-3">{titulo}</h2>
        <div className="text-sm text-stone-600 dark:text-stone-400 mb-5">{children}</div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${
              peligro
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            } disabled:opacity-60`}
          >
            {confirmando ? "Procesando…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
