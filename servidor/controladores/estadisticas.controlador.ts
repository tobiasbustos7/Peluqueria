import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";

const PERIODO_MES = 30;

export async function obtenerResumen(_req: Request, res: Response) {
  const hoy = new Date().toISOString().split("T")[0];

  const [[turnosHoy]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM turnos WHERE fecha = ? AND estado != 'cancelado'",
    [hoy],
  );

  const [[turnosPendientes]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM turnos WHERE estado = 'pendiente'",
  );

  const [[serviciosActivos]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM servicios WHERE activo = TRUE",
  );

  const [[empleadosActivos]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM empleados WHERE activo = TRUE",
  );

  const [[clientesRegistrados]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM clientes",
  );

  const [ingresosMes] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(s.precio), 0) AS total
     FROM turnos t
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.estado = 'completado'
       AND t.fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [PERIODO_MES],
  );

  res.json({
    turnos_hoy: turnosHoy.total,
    turnos_pendientes: turnosPendientes.total,
    servicios_activos: serviciosActivos.total,
    empleados_activos: empleadosActivos.total,
    clientes_registrados: clientesRegistrados.total,
    ingresos_mes: Number(ingresosMes[0].total),
  });
}

export async function obtenerTurnosPorMes(req: Request, res: Response) {
  const anio = Number(req.query.anio) || new Date().getFullYear();

  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT MONTH(fecha) AS mes, estado, COUNT(*) AS total
     FROM turnos
     WHERE YEAR(fecha) = ?
     GROUP BY MONTH(fecha), estado
     ORDER BY mes`,
    [anio],
  );

  res.json(filas);
}

export async function obtenerServiciosPopulares(_req: Request, res: Response) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id, s.nombre, COUNT(*) AS total_reservas
     FROM turnos t
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.estado != 'cancelado'
     GROUP BY s.id, s.nombre
     ORDER BY total_reservas DESC
     LIMIT 10`,
  );

  res.json(filas);
}

export async function obtenerIngresosPorMes(req: Request, res: Response) {
  const anio = Number(req.query.anio) || new Date().getFullYear();

  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT MONTH(t.fecha) AS mes,
            COALESCE(SUM(s.precio), 0) AS total_ingresos,
            COUNT(*) AS total_turnos
     FROM turnos t
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.estado = 'completado' AND YEAR(t.fecha) = ?
     GROUP BY MONTH(t.fecha)
     ORDER BY mes`,
    [anio],
  );

  res.json(filas);
}
