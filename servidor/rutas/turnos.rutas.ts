import { Router } from "express";
import {
  listarTurnosHandler,
  crearTurnoHandler,
  cambiarEstadoTurnoHandler,
  disponibilidadHandler,
} from "../controladores/turnos.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/disponibilidad", disponibilidadHandler);
router.get("/", verificarToken, listarTurnosHandler);
router.post("/", verificarToken, verificarRol("cliente"), crearTurnoHandler);
router.patch("/:id/estado", verificarToken, verificarRol("admin", "empleado"), cambiarEstadoTurnoHandler);

export default router;
