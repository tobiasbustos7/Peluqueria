import { Router } from "express";
import {
  listarEmpleados,
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} from "../controladores/empleados.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";
import { verificarRol } from "../middleware/verificar-rol.js";

const router = Router();

router.get("/", listarEmpleados);
router.get("/:id", verificarToken, verificarRol("admin"), obtenerEmpleado);
router.post("/", verificarToken, verificarRol("admin"), crearEmpleado);
router.put("/:id", verificarToken, verificarRol("admin"), actualizarEmpleado);
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarEmpleado);

export default router;
