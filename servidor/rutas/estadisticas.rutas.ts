import { Router } from "express";
import {
  obtenerResumen,
  obtenerTurnosPorMes,
  obtenerServiciosPopulares,
  obtenerIngresosPorMes,
} from "../controladores/estadisticas.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/resumen", verificarToken, verificarRol("admin", "empleado"), obtenerResumen);
router.get("/turnos-por-mes", verificarToken, verificarRol("admin", "empleado"), obtenerTurnosPorMes);
router.get("/servicios-populares", verificarToken, verificarRol("admin", "empleado"), obtenerServiciosPopulares);
router.get("/ingresos-por-mes", verificarToken, verificarRol("admin", "empleado"), obtenerIngresosPorMes);

export default router;
