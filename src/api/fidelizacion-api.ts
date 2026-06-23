const API_BASE = "/api";

async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${ruta}`, { headers: cabeceras, ...opciones });
  const datos = await res.json();
  if (!res.ok) throw datos;
  return datos as T;
}

export interface ConfigFidelizacion {
  id?: number;
  visitas_requeridas: number;
  descripcion_beneficio: string | null;
  activo?: boolean;
}

export interface VisitasCliente {
  visitas_acumuladas: number;
  visitas_requeridas: number;
  descripcion_beneficio: string | null;
  progreso: number;
  beneficio_activo: boolean;
}

export function obtenerConfiguracion() {
  return peticion<ConfigFidelizacion>("/fidelizacion/configuracion");
}

export function actualizarConfiguracion(datos: { visitas_requeridas: number; descripcion_beneficio: string }) {
  return peticion<ConfigFidelizacion>("/fidelizacion/configuracion", {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function obtenerMisVisitas() {
  return peticion<VisitasCliente>("/fidelizacion/mis-visitas");
}

export interface Confignotificaciones {
  id?: number;
  horas_antes: number;
  activo: boolean;
}

export function obtenerNotificaciones() {
  return peticion<Confignotificaciones>("/fidelizacion/notificaciones");
}

export function actualizarNotificaciones(datos: { horas_antes: number; activo: boolean }) {
  return peticion<Confignotificaciones>("/fidelizacion/notificaciones", {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}
