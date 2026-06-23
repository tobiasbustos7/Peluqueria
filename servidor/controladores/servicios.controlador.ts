import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";
import { crearServicioSchema, actualizarServicioSchema } from "../esquemas/servicio.esquema.js";
import type { RespuestaError } from "../tipos/index.js";

export async function listarServicios(req: Request, res: Response) {
  const soloActivos = req.query.activos === "true";

  let query = "SELECT * FROM servicios";
  const params: unknown[] = [];

  if (soloActivos) {
    query += " WHERE activo = ?";
    params.push(true);
  }

  query += " ORDER BY nombre";

  const [filas] = await pool.execute<RowDataPacket[]>(query, params);
  res.json(filas);
}

export async function obtenerServicio(req: Request, res: Response) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM servicios WHERE id = ?",
    [req.params.id],
  );

  if (filas.length === 0) {
    res.status(404).json({ mensaje: "Servicio no encontrado" });
    return;
  }

  res.json(filas[0]);
}

export async function crearServicio(req: Request, res: Response) {
  const resultado = await crearServicioSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores: RespuestaError["errores"] = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES (?, ?, ?, ?)",
    [resultado.data.nombre, resultado.data.descripcion ?? null, resultado.data.duracion_minutos, resultado.data.precio],
  );

  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM servicios WHERE id = ?",
    [result.insertId],
  );

  res.status(201).json(filas[0]);
}

export async function actualizarServicio(req: Request, res: Response) {
  const resultado = await actualizarServicioSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores: RespuestaError["errores"] = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  const [existente] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM servicios WHERE id = ?",
    [req.params.id],
  );

  if (existente.length === 0) {
    res.status(404).json({ mensaje: "Servicio no encontrado" });
    return;
  }

  const campos: string[] = [];
  const valores: unknown[] = [];

  for (const [key, value] of Object.entries(resultado.data)) {
    if (value !== undefined) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }
  }

  if (campos.length === 0) {
    res.status(400).json({ mensaje: "No hay campos para actualizar" });
    return;
  }

  valores.push(req.params.id);
  await pool.execute<ResultSetHeader>(
    `UPDATE servicios SET ${campos.join(", ")} WHERE id = ?`,
    valores,
  );

  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM servicios WHERE id = ?",
    [req.params.id],
  );

  res.json(filas[0]);
}

export async function eliminarServicio(req: Request, res: Response) {
  const [existente] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM servicios WHERE id = ?",
    [req.params.id],
  );

  if (existente.length === 0) {
    res.status(404).json({ mensaje: "Servicio no encontrado" });
    return;
  }

  await pool.execute<ResultSetHeader>(
    "DELETE FROM servicios WHERE id = ?",
    [req.params.id],
  );

  res.json({ mensaje: "Servicio eliminado correctamente" });
}
