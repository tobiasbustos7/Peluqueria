import type { Servicio, ErrorApi } from "../tipos";

const API_BASE = "/api";

async function peticion<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    headers: cabeceras,
    ...opciones,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw datos as ErrorApi;
  }

  return datos as T;
}

export function listarServicios(activos?: boolean) {
  const params = activos !== undefined ? `?activos=${activos}` : "";
  return peticion<Servicio[]>(`/servicios${params}`);
}

export function obtenerServicio(id: number) {
  return peticion<Servicio>(`/servicios/${id}`);
}

export function crearServicio(datos: Omit<Servicio, "id" | "activo">) {
  return peticion<Servicio>("/servicios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarServicio(id: number, datos: Partial<Omit<Servicio, "id">>) {
  return peticion<Servicio>(`/servicios/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function eliminarServicio(id: number) {
  return peticion<{ mensaje: string }>(`/servicios/${id}`, {
    method: "DELETE",
  });
}
