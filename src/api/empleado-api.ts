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

export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: "admin" | "empleado";
  activo: boolean;
}

export function listarEmpleados() {
  return peticion<Empleado[]>("/empleados");
}

export function obtenerEmpleado(id: number) {
  return peticion<Empleado>(`/empleados/${id}`);
}

export function crearEmpleado(datos: { nombre: string; email: string; telefono?: string; contrasena: string; rol?: string }) {
  return peticion<Empleado>("/empleados", { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarEmpleado(id: number, datos: Partial<Empleado & { contrasena: string }>) {
  return peticion<Empleado>(`/empleados/${id}`, { method: "PUT", body: JSON.stringify(datos) });
}

export function eliminarEmpleado(id: number) {
  return peticion<{ mensaje: string }>(`/empleados/${id}`, { method: "DELETE" });
}
