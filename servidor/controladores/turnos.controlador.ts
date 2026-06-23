import type { Request, Response } from "express";
import type { TokenPayload } from "../tipos/index.js";
import pool from "../config/base-datos.js";
import { crearTurnoSchema, cambiarEstadoTurnoSchema } from "../esquemas/turno.esquema.js";
import { listarTurnos, crearTurno, cambiarEstadoTurno } from "../servicios/turnos.servicio.js";
import { obtenerDisponibilidad } from "../servicios/disponibilidad.servicio.js";
import { incrementarVisitas } from "../servicios/fidelizacion.servicio.js";

export async function listarTurnosHandler(req: Request, res: Response) {
  const usuario = req.usuario as TokenPayload;

  if (usuario.rol === "cliente") {
    const [filas] = await listarTurnos("t.cliente_id = ?", [usuario.id]);
    res.json(filas);
    return;
  }

  const [filas] = await listarTurnos();
  res.json(filas);
}

export async function crearTurnoHandler(req: Request, res: Response) {
  const usuario = req.usuario as TokenPayload;
  const resultado = await crearTurnoSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  const { servicio_id, empleado_id, fecha, hora_inicio, observaciones } = resultado.data;

  const [servicioRows] = await (await import("../config/base-datos.js")).default.execute<import("mysql2").RowDataPacket[]>(
    "SELECT duracion_minutos FROM servicios WHERE id = ? AND activo = TRUE",
    [servicio_id],
  );

  if (servicioRows.length === 0) {
    res.status(400).json({ mensaje: "Servicio no encontrado o inactivo" });
    return;
  }

  const duracion = servicioRows[0].duracion_minutos as number;
  const [h, m] = hora_inicio.split(":").map(Number);
  const inicioMin = h * 60 + m;
  const finMin = inicioMin + duracion;
  const horaFin = `${String(Math.floor(finMin / 60)).padStart(2, "0")}:${String(finMin % 60).padStart(2, "0")}`;

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  if (fecha < hoyStr) {
    res.status(400).json({ mensaje: "No puedes agendar un turno en una fecha pasada" });
    return;
  }

  if (fecha === hoyStr) {
    const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes();
    if (inicioMin <= ahoraMin) {
      res.status(400).json({ mensaje: "No puedes agendar un turno en un horario que ya pasó" });
      return;
    }
  }

  const disponibles = await obtenerDisponibilidad(servicio_id, fecha, empleado_id);
  const slotValido = disponibles.some(
    (s) => s.empleado_id === empleado_id && s.hora_inicio === hora_inicio,
  );

  if (!slotValido) {
    res.status(409).json({ mensaje: "El horario seleccionado no está disponible" });
    return;
  }

  const turno = await crearTurno({
    cliente_id: usuario.id,
    empleado_id,
    servicio_id,
    fecha,
    hora_inicio,
    hora_fin: horaFin,
    observaciones: observaciones ?? "",
  });

  res.status(201).json(turno);
}

export async function cambiarEstadoTurnoHandler(req: Request, res: Response) {
  const resultado = await cambiarEstadoTurnoSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  const { estado: nuevoEstado } = resultado.data;

  const [antes] = await pool.execute<import("mysql2").RowDataPacket[]>(
    "SELECT estado, cliente_id FROM turnos WHERE id = ?",
    [req.params.id],
  );

  if (antes.length === 0) {
    res.status(404).json({ mensaje: "Turno no encontrado" });
    return;
  }

  const estadoAnterior = antes[0].estado as string;
  const clienteId = antes[0].cliente_id as number;

  const turno = await cambiarEstadoTurno(Number(req.params.id), nuevoEstado);

  if (nuevoEstado === "completado" && estadoAnterior !== "completado") {
    await incrementarVisitas(clienteId);
  }

  res.json(turno);
}

export async function disponibilidadHandler(req: Request, res: Response) {
  const servicio_id = Number(req.query.servicio_id);
  const fecha = req.query.fecha as string;
  const empleado_id = req.query.empleado_id ? Number(req.query.empleado_id) : undefined;

  if (!servicio_id || !fecha) {
    res.status(400).json({ mensaje: "servicio_id y fecha son requeridos" });
    return;
  }

  const slots = await obtenerDisponibilidad(servicio_id, fecha, empleado_id);
  res.json(slots);
}
