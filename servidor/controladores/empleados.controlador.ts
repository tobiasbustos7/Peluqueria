import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import pool from "../config/base-datos.js";

export async function listarEmpleados(_req: Request, res: Response) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT id, nombre, email, telefono, rol, activo FROM empleados ORDER BY nombre",
  );
  res.json(filas);
}

export async function obtenerEmpleado(req: Request, res: Response) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT id, nombre, email, telefono, rol, activo FROM empleados WHERE id = ?",
    [req.params.id],
  );
  if (filas.length === 0) {
    res.status(404).json({ mensaje: "Empleado no encontrado" });
    return;
  }
  res.json(filas[0]);
}

export async function crearEmpleado(req: Request, res: Response) {
  const { nombre, email, telefono, contrasena, rol } = req.body;

  if (!nombre || !email || !contrasena) {
    res.status(400).json({ mensaje: "nombre, email y contrasena son requeridos" });
    return;
  }

  const [existe] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM empleados WHERE email = ?",
    [email],
  );
  if (existe.length > 0) {
    res.status(409).json({ mensaje: "El email ya está registrado" });
    return;
  }

  const contrasena_hash = await bcrypt.hash(contrasena, 10);
  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO empleados (nombre, email, telefono, contrasena_hash, rol) VALUES (?, ?, ?, ?, ?)",
    [nombre, email, telefono ?? null, contrasena_hash, rol ?? "empleado"],
  );

  const [nuevo] = await pool.execute<RowDataPacket[]>(
    "SELECT id, nombre, email, telefono, rol, activo FROM empleados WHERE id = ?",
    [resultado.insertId],
  );
  res.status(201).json(nuevo[0]);
}

export async function actualizarEmpleado(req: Request, res: Response) {
  const { nombre, email, telefono, rol, activo, contrasena } = req.body;

  const [existente] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM empleados WHERE id = ?",
    [req.params.id],
  );
  if (existente.length === 0) {
    res.status(404).json({ mensaje: "Empleado no encontrado" });
    return;
  }

  if (email && email !== existente[0].email) {
    const [dup] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM empleados WHERE email = ? AND id != ?",
      [email, req.params.id],
    );
    if (dup.length > 0) {
      res.status(409).json({ mensaje: "El email ya está en uso" });
      return;
    }
  }

  const campos: string[] = [];
  const valores: (string | number | boolean | null)[] = [];

  if (nombre !== undefined) { campos.push("nombre = ?"); valores.push(nombre); }
  if (email !== undefined) { campos.push("email = ?"); valores.push(email); }
  if (telefono !== undefined) { campos.push("telefono = ?"); valores.push(telefono); }
  if (rol !== undefined) { campos.push("rol = ?"); valores.push(rol); }
  if (activo !== undefined) { campos.push("activo = ?"); valores.push(activo); }
  if (contrasena) {
    const hash = await bcrypt.hash(contrasena, 10);
    campos.push("contrasena_hash = ?");
    valores.push(hash);
  }

  if (campos.length === 0) {
    res.status(400).json({ mensaje: "No hay campos para actualizar" });
    return;
  }

  valores.push(Number(req.params.id));
  await pool.execute<ResultSetHeader>(
    `UPDATE empleados SET ${campos.join(", ")} WHERE id = ?`,
    valores,
  );

  const [actualizado] = await pool.execute<RowDataPacket[]>(
    "SELECT id, nombre, email, telefono, rol, activo FROM empleados WHERE id = ?",
    [req.params.id],
  );
  res.json(actualizado[0]);
}

export async function eliminarEmpleado(req: Request, res: Response) {
  const [resultado] = await pool.execute<ResultSetHeader>(
    "DELETE FROM empleados WHERE id = ?",
    [req.params.id],
  );
  if (resultado.affectedRows === 0) {
    res.status(404).json({ mensaje: "Empleado no encontrado" });
    return;
  }
  res.json({ mensaje: "Empleado eliminado" });
}
