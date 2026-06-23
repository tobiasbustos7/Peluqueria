import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENTORNO } from "../config/entorno.js";
import type { TokenPayload } from "../tipos/index.js";

declare module "express" {
  interface Request {
    usuario?: TokenPayload;
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith("Bearer ")) {
    res.status(401).json({ mensaje: "Token no proporcionado" });
    return;
  }

  const token = cabecera.split(" ")[1];

  try {
    const payload = jwt.verify(token, ENTORNO.JWT_SECRETO) as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}
