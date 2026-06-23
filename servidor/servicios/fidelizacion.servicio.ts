import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";

export async function obtenerConfiguracion() {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM configfidelizacion WHERE activo = TRUE LIMIT 1",
  );
  return filas[0] as
    | { id: number; visitas_requeridas: number; descripcion_beneficio: string | null; activo: boolean }
    | undefined;
}

export async function actualizarConfiguracion(datos: {
  visitas_requeridas: number;
  descripcion_beneficio: string;
}) {
  const [existente] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM configfidelizacion LIMIT 1",
  );

  if (existente.length > 0) {
    await pool.execute<ResultSetHeader>(
      "UPDATE configfidelizacion SET visitas_requeridas = ?, descripcion_beneficio = ? WHERE id = ?",
      [datos.visitas_requeridas, datos.descripcion_beneficio, existente[0].id],
    );
  } else {
    await pool.execute<ResultSetHeader>(
      "INSERT INTO configfidelizacion (visitas_requeridas, descripcion_beneficio) VALUES (?, ?)",
      [datos.visitas_requeridas, datos.descripcion_beneficio],
    );
  }

  return obtenerConfiguracion();
}

export async function obtenerVisitasCliente(clienteId: number) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT visitas_acumuladas FROM clientes WHERE id = ?",
    [clienteId],
  );

  if (filas.length === 0) return null;

  const config = await obtenerConfiguracion();
  const visitas = filas[0].visitas_acumuladas as number;

  return {
    visitas_acumuladas: visitas,
    visitas_requeridas: config?.visitas_requeridas ?? 0,
    descripcion_beneficio: config?.descripcion_beneficio ?? null,
    progreso: config ? Math.min(Math.round((visitas / config.visitas_requeridas) * 100), 100) : 0,
    beneficio_activo: config ? visitas >= config.visitas_requeridas : false,
  };
}

export async function incrementarVisitas(clienteId: number) {
  await pool.execute<ResultSetHeader>(
    "UPDATE clientes SET visitas_acumuladas = visitas_acumuladas + 1 WHERE id = ?",
    [clienteId],
  );
}
