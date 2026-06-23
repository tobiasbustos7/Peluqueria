import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";
import type { Cliente, Empleado, RegistrarDTO, Usuario } from "../tipos/index.js";

export async function registrarCliente(datos: RegistrarDTO): Promise<Cliente> {
  const existe = await obtenerPorEmail(datos.email);
  if (existe) {
    throw new Error("YA_EXISTE_EMAIL");
  }

  const contrasena_hash = await bcrypt.hash(datos.contrasena, 10);

  const [resultado] = await pool.execute<ResultSetHeader>(
    "INSERT INTO clientes (nombre, email, telefono, contrasena_hash) VALUES (?, ?, ?, ?)",
    [datos.nombre, datos.email, datos.telefono, contrasena_hash],
  );

  const insertId = resultado.insertId;
  const cliente = await obtenerPorId(insertId);
  return cliente!;
}

export async function obtenerPorEmail(email: string): Promise<Usuario | null> {
  let [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT *, 'cliente' AS tipo FROM clientes WHERE email = ?",
    [email],
  );

  if (filas.length > 0) {
    return filas[0] as unknown as Cliente;
  }

  [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT *, 'empleado' AS tipo FROM empleados WHERE email = ?",
    [email],
  );

  if (filas.length > 0) {
    return filas[0] as unknown as Empleado;
  }

  return null;
}

export async function obtenerPorId(id: number): Promise<Cliente | null> {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM clientes WHERE id = ?",
    [id],
  );

  if (filas.length === 0) return null;
  return filas[0] as Cliente;
}
