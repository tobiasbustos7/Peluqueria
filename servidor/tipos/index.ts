export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  contrasena_hash: string;
  visitas_acumuladas: number;
  fecha_registro: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  contrasena_hash: string;
  rol: "admin" | "empleado";
  activo: boolean;
}

export type Usuario = Cliente | Empleado;

export type RolUsuario = "cliente" | "empleado" | "admin";

export interface TokenPayload {
  id: number;
  email: string;
  rol: RolUsuario;
}

export interface RegistrarDTO {
  nombre: string;
  email: string;
  telefono: string;
  contrasena: string;
}

export interface IniciarSesionDTO {
  email: string;
  contrasena: string;
}

export interface RespuestaAutenticacion {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    rol: RolUsuario;
    visitas_acumuladas?: number;
  };
}

export interface RespuestaError {
  mensaje: string;
  errores?: { campo: string; mensaje: string }[];
}

// ============================================
// Tipos para futuros módulos
// ============================================

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

export interface Turno {
  id: number;
  cliente_id: number;
  empleado_id: number;
  servicio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "pendiente" | "confirmado" | "cancelado" | "completado";
  observaciones: string | null;
}

export interface Horario {
  id: number;
  empleado_id: number;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
}

export interface ConfigFidelizacion {
  id: number;
  visitas_requeridas: number;
  descripcion_beneficio: string | null;
  activo: boolean;
}
