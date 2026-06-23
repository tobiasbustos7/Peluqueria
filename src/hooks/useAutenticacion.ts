import { use } from "react";
import { ContextoSesion, type ContextoSesionValor } from "../contexto/SesionContexto";

export function useAutenticacion(): ContextoSesionValor {
  const contexto = use(ContextoSesion);
  if (!contexto) {
    throw new Error("useAutenticacion debe usarse dentro de ProveedorSesion");
  }
  return contexto;
}
