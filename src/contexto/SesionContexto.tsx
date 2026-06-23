import { createContext, useState, useCallback, type ReactNode } from "react";
import type { UsuarioSesion, RolUsuario, IniciarSesionDTO, RegistrarDTO } from "../tipos";
import * as clienteApi from "../api/cliente-api";

export interface EstadoSesion {
  usuario: UsuarioSesion | null;
  token: string | null;
  rol: RolUsuario | null;
  cargando: boolean;
}

export interface AccionesSesion {
  iniciarSesion: (datos: IniciarSesionDTO) => Promise<void>;
  registrarse: (datos: RegistrarDTO) => Promise<void>;
  cerrarSesion: () => void;
  actualizarDatos?: (datos: Partial<UsuarioSesion>) => void;
}

export type ContextoSesionValor = EstadoSesion & AccionesSesion;

// eslint-disable-next-line react-refresh/only-export-components
export const ContextoSesion = createContext<ContextoSesionValor | null>(null);

function obtenerSesionGuardada(): { token: string; usuario: UsuarioSesion } | null {
  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  if (token && usuario) {
    try {
      return { token, usuario: JSON.parse(usuario) };
    } catch {
      return null;
    }
  }
  return null;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const guardada = obtenerSesionGuardada();
  const [cargando, setCargando] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(guardada?.usuario ?? null);
  const [token, setToken] = useState<string | null>(guardada?.token ?? null);

  const guardarSesion = useCallback((respuesta: { token: string; usuario: UsuarioSesion }) => {
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    localStorage.setItem("token", respuesta.token);
    localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
  }, []);

  const iniciarSesion = useCallback(async (datos: IniciarSesionDTO) => {
    setCargando(true);
    try {
      const respuesta = await clienteApi.iniciarSesion(datos);
      guardarSesion(respuesta);
    } finally {
      setCargando(false);
    }
  }, [guardarSesion]);

  const registrarse = useCallback(async (datos: RegistrarDTO) => {
    setCargando(true);
    try {
      const respuesta = await clienteApi.registrarse(datos);
      guardarSesion(respuesta);
    } finally {
      setCargando(false);
    }
  }, [guardarSesion]);

  const cerrarSesion = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }, []);

  const actualizarDatos = useCallback((datos: Partial<UsuarioSesion>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const nuevo = { ...prev, ...datos };
      localStorage.setItem("usuario", JSON.stringify(nuevo));
      return nuevo;
    });
  }, []);

  const valor: ContextoSesionValor = {
    usuario,
    token,
    rol: usuario?.rol ?? null,
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    actualizarDatos,
  };

  return (
    <ContextoSesion.Provider value={valor}>
      {children}
    </ContextoSesion.Provider>
  );
}
