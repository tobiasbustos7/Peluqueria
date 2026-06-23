import { z } from "zod/v4";

export const registroSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string({ required_error: "El email es obligatorio" }).email("Email inválido"),
  telefono: z.string({ required_error: "El teléfono es obligatorio" }).regex(/^\d{7,15}$/, "Teléfono inválido (solo dígitos, 7-15)"),
  contrasena: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "Mínimo 6 caracteres").max(100, "Máximo 100 caracteres"),
});

export const inicioSesionSchema = z.object({
  email: z.string({ required_error: "El email es obligatorio" }).email("Email inválido"),
  contrasena: z.string({ required_error: "La contraseña es obligatoria" }).min(1, "La contraseña es obligatoria"),
});
