import { Router } from "express";
import {
  registrarse,
  iniciarSesion,
  perfil,
  actualizarPerfil,
  cambiarContrasena,
  olvideContrasena,
  reestablecerContrasena,
} from "../controladores/autenticacion.controlador.js";
import { verificarToken } from "../middleware/verificar-token.js";

const router = Router();

router.post("/registrarse", registrarse);
router.post("/iniciar-sesion", iniciarSesion);
router.get("/perfil", verificarToken, perfil);
router.put("/perfil", verificarToken, actualizarPerfil);
router.put("/cambiar-contrasena", verificarToken, cambiarContrasena);
router.post("/olvide-contrasena", olvideContrasena);
router.post("/reestablecer-contrasena", reestablecerContrasena);

export default router;
