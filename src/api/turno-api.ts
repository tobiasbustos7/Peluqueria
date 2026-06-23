import type { Turno, ErrorApi } from "../tipos";

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

export interface SlotDisponible {
  empleado_id: number;
  empleado_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export function listarTurnos() {
  return peticion<Turno[]>("/turnos");
}

export function crearTurno(datos: {
  servicio_id: number;
  empleado_id: number;
  fecha: string;
  hora_inicio: string;
  observaciones?: string;
}) {
  return peticion<Turno>("/turnos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoTurno(id: number, estado: Turno["estado"]) {
  return peticion<Turno>(`/turnos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function obtenerDisponibilidad(servicio_id: number, fecha: string, empleado_id?: number) {
  const params = new URLSearchParams({ servicio_id: String(servicio_id), fecha });
  if (empleado_id) params.set("empleado_id", String(empleado_id));
  return peticion<SlotDisponible[]>(`/turnos/disponibilidad?${params}`);
}
