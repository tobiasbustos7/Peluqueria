import { Router } from "express";
import { listarHorarios, actualizarHorarios } from "../controladores/horarios.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/", listarHorarios);
router.put("/", verificarToken, verificarRol("admin", "empleado"), actualizarHorarios);

export default router;
