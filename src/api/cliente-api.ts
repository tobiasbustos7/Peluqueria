import type { RespuestaAutenticacion, RegistrarDTO, IniciarSesionDTO, ErrorApi } from "../tipos";

const API_BASE = "/api";

async function peticion<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw datos as ErrorApi;
  }

  return datos as T;
}

export function iniciarSesion(datos: IniciarSesionDTO) {
  return peticion<RespuestaAutenticacion>("/autenticacion/iniciar-sesion", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function registrarse(datos: RegistrarDTO) {
  return peticion<RespuestaAutenticacion>("/autenticacion/registrarse", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function obtenerPerfil(token: string) {
  return peticion<{ usuario: { id: number; email: string; rol: string } }>(
    "/autenticacion/perfil",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
