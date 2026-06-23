import type { Request, Response } from "express";
import type { TokenPayload } from "../tipos/index.js";
import {
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerVisitasCliente,
} from "../servicios/fidelizacion.servicio.js";
import {
  obtenerConfignotificaciones,
  actualizarConfignotificaciones,
} from "../servicios/notificacion.servicio.js";

export async function obtenerConfiguracionHandler(_req: Request, res: Response) {
  const config = await obtenerConfiguracion();
  res.json(config ?? {});
}

export async function actualizarConfiguracionHandler(req: Request, res: Response) {
  const { visitas_requeridas, descripcion_beneficio } = req.body;

  if (!visitas_requeridas || typeof visitas_requeridas !== "number" || visitas_requeridas < 1) {
    res.status(400).json({ mensaje: "visitas_requeridas debe ser un número mayor a 0" });
    return;
  }

  const config = await actualizarConfiguracion({
    visitas_requeridas,
    descripcion_beneficio: descripcion_beneficio ?? "",
  });

  res.json(config);
}

export async function misVisitasHandler(req: Request, res: Response) {
  const usuario = req.usuario as TokenPayload;

  if (usuario.rol !== "cliente") {
    res.status(403).json({ mensaje: "Solo los clientes pueden ver sus visitas" });
    return;
  }

  const info = await obtenerVisitasCliente(usuario.id);
  if (!info) {
    res.status(404).json({ mensaje: "Cliente no encontrado" });
    return;
  }

  res.json(info);
}

export async function obtenerNotificacionesHandler(_req: Request, res: Response) {
  const config = await obtenerConfignotificaciones();
  res.json(config ?? { horas_antes: 24, activo: true });
}

export async function actualizarNotificacionesHandler(req: Request, res: Response) {
  const { horas_antes, activo } = req.body;

  if (typeof horas_antes !== "number" || horas_antes < 1) {
    res.status(400).json({ mensaje: "horas_antes debe ser un número mayor a 0" });
    return;
  }

  const config = await actualizarConfignotificaciones({
    horas_antes,
    activo: typeof activo === "boolean" ? activo : true,
  });

  res.json(config);
}
