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

export interface ResumenDashboard {
  turnos_hoy: number;
  turnos_pendientes: number;
  servicios_activos: number;
  empleados_activos: number;
  clientes_registrados: number;
  ingresos_mes: number;
}

export interface TurnoPorMes {
  mes: number;
  estado: string;
  total: number;
}

export interface ServicioPopular {
  id: number;
  nombre: string;
  total_reservas: number;
}

export interface IngresoPorMes {
  mes: number;
  total_ingresos: number;
  total_turnos: number;
}

export function obtenerResumen() {
  return peticion<ResumenDashboard>("/estadisticas/resumen");
}

export function obtenerTurnosPorMes(anio?: number) {
  const params = anio ? `?anio=${anio}` : "";
  return peticion<TurnoPorMes[]>(`/estadisticas/turnos-por-mes${params}`);
}

export function obtenerServiciosPopulares() {
  return peticion<ServicioPopular[]>("/estadisticas/servicios-populares");
}

export function obtenerIngresosPorMes(anio?: number) {
  const params = anio ? `?anio=${anio}` : "";
  return peticion<IngresoPorMes[]>(`/estadisticas/ingresos-por-mes${params}`);
}
