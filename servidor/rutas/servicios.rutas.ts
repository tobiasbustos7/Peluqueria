import { Router } from "express";
import { listarServicios, obtenerServicio, crearServicio, actualizarServicio, eliminarServicio } from "../controladores/servicios.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/", listarServicios);
router.get("/:id", obtenerServicio);
router.post("/", verificarToken, verificarRol("admin", "empleado"), crearServicio);
router.put("/:id", verificarToken, verificarRol("admin", "empleado"), actualizarServicio);
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarServicio);

export default router;
