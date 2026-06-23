import type { Request, Response, NextFunction } from "express";
import type { RolUsuario } from "../tipos/index.js";

export function verificarRol(...roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      res.status(401).json({ mensaje: "No autenticado" });
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ mensaje: "No tienes permiso para esta acción" });
      return;
    }

    next();
  };
}
