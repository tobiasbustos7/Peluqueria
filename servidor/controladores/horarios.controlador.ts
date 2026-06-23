import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";

export async function listarHorarios(req: Request, res: Response) {
  let query = "SELECT h.*, e.nombre AS empleado_nombre FROM horarios h JOIN empleados e ON e.id = h.empleado_id";
  const params: unknown[] = [];

  if (req.query.empleado_id) {
    query += " WHERE h.empleado_id = ?";
    params.push(req.query.empleado_id);
  }

  query += " ORDER BY h.empleado_id, h.dia_semana";

  const [filas] = await pool.execute<RowDataPacket[]>(query, params);
  res.json(filas);
}

export async function actualizarHorarios(req: Request, res: Response) {
  const { empleado_id, horarios } = req.body;

  if (!empleado_id || !Array.isArray(horarios)) {
    res.status(400).json({ mensaje: "empleado_id y horarios son requeridos" });
    return;
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    await conexion.execute<ResultSetHeader>(
      "DELETE FROM horarios WHERE empleado_id = ?",
      [empleado_id],
    );

    for (const h of horarios) {
      await conexion.execute<ResultSetHeader>(
        "INSERT INTO horarios (empleado_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES (?, ?, ?, ?, ?)",
        [empleado_id, h.dia_semana, h.hora_apertura, h.hora_cierre, h.activo ?? true],
      );
    }

    await conexion.commit();

    const [filas] = await pool.execute<RowDataPacket[]>(
      "SELECT h.*, e.nombre AS empleado_nombre FROM horarios h JOIN empleados e ON e.id = h.empleado_id WHERE h.empleado_id = ? ORDER BY h.dia_semana",
      [empleado_id],
    );

    res.json(filas);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
