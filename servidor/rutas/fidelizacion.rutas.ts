import { Router } from "express";
import {
  obtenerConfiguracionHandler,
  actualizarConfiguracionHandler,
  misVisitasHandler,
  obtenerNotificacionesHandler,
  actualizarNotificacionesHandler,
} from "../controladores/fidelizacion.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/configuracion", obtenerConfiguracionHandler);
router.put("/configuracion", verificarToken, verificarRol("admin"), actualizarConfiguracionHandler);
router.get("/mis-visitas", verificarToken, misVisitasHandler);
router.get("/notificaciones", verificarToken, verificarRol("admin"), obtenerNotificacionesHandler);
router.put("/notificaciones", verificarToken, verificarRol("admin"), actualizarNotificacionesHandler);

export default router;
