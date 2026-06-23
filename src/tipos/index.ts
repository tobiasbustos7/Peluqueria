export type RolUsuario = "cliente" | "empleado" | "admin";

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  visitas_acumuladas?: number;
}

export interface RespuestaAutenticacion {
  token: string;
  usuario: UsuarioSesion;
}

export interface ErrorApi {
  mensaje: string;
  errores?: { campo: string; mensaje: string }[];
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
