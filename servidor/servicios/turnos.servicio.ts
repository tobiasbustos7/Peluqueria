import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";

export interface TurnoCompleto extends RowDataPacket {
  id: number;
  cliente_id: number;
  empleado_id: number;
  servicio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  observaciones: string | null;
  cliente_nombre: string;
  empleado_nombre: string;
  servicio_nombre: string;
  servicio_duracion: number;
}

export async function listarTurnos(where?: string, params?: unknown[]) {
  let query = `
    SELECT t.*, c.nombre AS cliente_nombre, e.nombre AS empleado_nombre,
           s.nombre AS servicio_nombre, s.duracion_minutos AS servicio_duracion
    FROM turnos t
    JOIN clientes c ON c.id = t.cliente_id
    JOIN empleados e ON e.id = t.empleado_id
    JOIN servicios s ON s.id = t.servicio_id
  `;
  if (where) query += ` WHERE ${where}`;
  query += " ORDER BY t.fecha DESC, t.hora_inicio DESC";

  return pool.execute<TurnoCompleto[]>(query, params ?? []);
}

export async function crearTurno(datos: {
  cliente_id: number;
  empleado_id: number;
  servicio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  observaciones: string;
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO turnos (cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [datos.cliente_id, datos.empleado_id, datos.servicio_id, datos.fecha, datos.hora_inicio, datos.hora_fin, datos.observaciones || null],
  );

  const [filas] = await pool.execute<TurnoCompleto[]>(
    `SELECT t.*, c.nombre AS cliente_nombre, e.nombre AS empleado_nombre,
            s.nombre AS servicio_nombre, s.duracion_minutos AS servicio_duracion
     FROM turnos t
     JOIN clientes c ON c.id = t.cliente_id
     JOIN empleados e ON e.id = t.empleado_id
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.id = ?`,
    [result.insertId],
  );

  return filas[0];
}

export async function cambiarEstadoTurno(id: number, estado: string) {
  await pool.execute<ResultSetHeader>(
    "UPDATE turnos SET estado = ? WHERE id = ?",
    [estado, id],
  );

  const [filas] = await pool.execute<TurnoCompleto[]>(
    `SELECT t.*, c.nombre AS cliente_nombre, e.nombre AS empleado_nombre,
            s.nombre AS servicio_nombre, s.duracion_minutos AS servicio_duracion
     FROM turnos t
     JOIN clientes c ON c.id = t.cliente_id
     JOIN empleados e ON e.id = t.empleado_id
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.id = ?`,
    [id],
  );

  return filas[0];
}
