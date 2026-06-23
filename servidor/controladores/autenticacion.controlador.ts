import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ENTORNO } from "../config/entorno.js";
import pool from "../config/base-datos.js";
import { registroSchema, inicioSesionSchema } from "../esquemas/cliente.esquema.js";
import { registrarCliente, obtenerPorEmail } from "../servicios/clientes.servicio.js";
import type { TokenPayload, RespuestaAutenticacion, RespuestaError, Cliente, Empleado } from "../tipos/index.js";
import { enviarCorreo } from "../utilidades/correo.js";

export async function registrarse(req: Request, res: Response) {
  const resultado = await registroSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores: RespuestaError["errores"] = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  try {
    const cliente = await registrarCliente(resultado.data);

    const payload: TokenPayload = { id: cliente.id, email: cliente.email, rol: "cliente" };
    const token = jwt.sign(payload, ENTORNO.JWT_SECRETO, { expiresIn: ENTORNO.JWT_EXPIRACION });

    const respuesta: RespuestaAutenticacion = {
      token,
      usuario: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        rol: "cliente",
        visitas_acumuladas: cliente.visitas_acumuladas,
      },
    };

    res.status(201).json(respuesta);
  } catch (error) {
    if (error instanceof Error && error.message === "YA_EXISTE_EMAIL") {
      res.status(409).json({ mensaje: "El email ya está registrado" });
      return;
    }
    throw error;
  }
}

export async function iniciarSesion(req: Request, res: Response) {
  const resultado = await inicioSesionSchema.safeParseAsync(req.body);

  if (!resultado.success) {
    const errores: RespuestaError["errores"] = resultado.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    res.status(400).json({ mensaje: "Datos inválidos", errores });
    return;
  }

  const { email, contrasena } = resultado.data;
  const usuario = await obtenerPorEmail(email);

  if (!usuario) {
    res.status(401).json({ mensaje: "Credenciales inválidas" });
    return;
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
  if (!contrasenaValida) {
    res.status(401).json({ mensaje: "Credenciales inválidas" });
    return;
  }

  const esCliente = "visitas_acumuladas" in usuario;
  const payload: TokenPayload = {
    id: usuario.id,
    email: usuario.email,
    rol: esCliente ? "cliente" : (usuario as Empleado).rol,
  };

  const token = jwt.sign(payload, ENTORNO.JWT_SECRETO, { expiresIn: ENTORNO.JWT_EXPIRACION });

  const respuesta: RespuestaAutenticacion = {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: payload.rol,
      ...(esCliente ? { visitas_acumuladas: (usuario as Cliente).visitas_acumuladas } : {}),
    },
  };

  res.json(respuesta);
}

export function perfil(req: Request, res: Response) {
  if (!req.usuario) {
    res.status(401).json({ mensaje: "No autenticado" });
    return;
  }

  res.json({ usuario: req.usuario });
}

export async function actualizarPerfil(req: Request, res: Response) {
  if (!req.usuario) {
    res.status(401).json({ mensaje: "No autenticado" });
    return;
  }

  const { nombre, telefono } = req.body;
  const esCliente = req.usuario.rol === "cliente";
  const tabla = esCliente ? "clientes" : "empleados";

  const campos: string[] = [];
  const valores: (string | null)[] = [];
  if (nombre !== undefined) { campos.push("nombre = ?"); valores.push(nombre); }
  if (telefono !== undefined) { campos.push("telefono = ?"); valores.push(telefono); }

  if (campos.length === 0) {
    res.status(400).json({ mensaje: "No hay campos para actualizar" });
    return;
  }

  valores.push(String(req.usuario.id));
  await pool.execute<ResultSetHeader>(
    `UPDATE ${tabla} SET ${campos.join(", ")} WHERE id = ?`,
    valores,
  );

  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT id, nombre, email, telefono${esCliente ? ", visitas_acumuladas" : ", rol"} FROM ${tabla} WHERE id = ?`,
    [req.usuario.id],
  );

  res.json({ usuario: filas[0] });
}

export async function cambiarContrasena(req: Request, res: Response) {
  if (!req.usuario) {
    res.status(401).json({ mensaje: "No autenticado" });
    return;
  }

  const { contrasena_actual, contrasena_nueva } = req.body;
  if (!contrasena_actual || !contrasena_nueva) {
    res.status(400).json({ mensaje: "contrasena_actual y contrasena_nueva son requeridas" });
    return;
  }
  if (contrasena_nueva.length < 6) {
    res.status(400).json({ mensaje: "La nueva contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const esCliente = req.usuario.rol === "cliente";
  const tabla = esCliente ? "clientes" : "empleados";

  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT contrasena_hash FROM ${tabla} WHERE id = ?`,
    [req.usuario.id],
  );

  if (filas.length === 0) {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
    return;
  }

  const valida = await bcrypt.compare(contrasena_actual, filas[0].contrasena_hash);
  if (!valida) {
    res.status(401).json({ mensaje: "La contraseña actual es incorrecta" });
    return;
  }

  const hash = await bcrypt.hash(contrasena_nueva, 10);
  await pool.execute<ResultSetHeader>(
    `UPDATE ${tabla} SET contrasena_hash = ? WHERE id = ?`,
    [hash, req.usuario.id],
  );

  res.json({ mensaje: "Contraseña actualizada correctamente" });
}

const tokensReset: Map<string, { email: string; expira: Date }> = new Map();

export async function olvideContrasena(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ mensaje: "Email requerido" });
    return;
  }

  const usuario = await obtenerPorEmail(email);
  if (!usuario) {
    res.json({ mensaje: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña" });
    return;
  }

  const token = crypto.randomUUID();
  const expira = new Date(Date.now() + 60 * 60 * 1000);
  tokensReset.set(token, { email, expira });

  const enlace = `${ENTORNO.FRONTEND_URL}/reestablecer-contrasena?token=${token}`;

  await enviarCorreo({
    para: email,
    asunto: "Restablecer contraseña - Peluquería",
    texto: `Para restablecer tu contraseña, haz clic en el siguiente enlace:\n\n${enlace}\n\nEste enlace expira en 1 hora.`,
    html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><p><a href="${enlace}">${enlace}</a></p><p>Este enlace expira en 1 hora.</p>`,
  });

  res.json({ mensaje: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña" });
}

export async function reestablecerContrasena(req: Request, res: Response) {
  const { token, contrasena_nueva } = req.body;

  if (!token || !contrasena_nueva) {
    res.status(400).json({ mensaje: "token y contrasena_nueva son requeridos" });
    return;
  }
  if (contrasena_nueva.length < 6) {
    res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const dato = tokensReset.get(token);
  if (!dato || dato.expira < new Date()) {
    tokensReset.delete(token);
    res.status(400).json({ mensaje: "Token inválido o expirado" });
    return;
  }

  const usuario = await obtenerPorEmail(dato.email);
  if (!usuario) {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
    return;
  }

  const hash = await bcrypt.hash(contrasena_nueva, 10);
  const esCliente = "visitas_acumuladas" in usuario;
  const tabla = esCliente ? "clientes" : "empleados";

  await pool.execute<ResultSetHeader>(
    `UPDATE ${tabla} SET contrasena_hash = ? WHERE email = ?`,
    [hash, dato.email],
  );

  tokensReset.delete(token);
  res.json({ mensaje: "Contraseña restablecida correctamente" });
}
