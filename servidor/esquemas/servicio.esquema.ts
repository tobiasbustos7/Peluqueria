import { z } from "zod/v4";

export const crearServicioSchema = z.object({
  nombre: z.string({ message: "El nombre es obligatorio" }).min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  descripcion: z.string({ message: "La descripción es obligatoria" }).max(500, "Máximo 500 caracteres").optional().default(""),
  duracion_minutos: z.number({ message: "La duración es obligatoria" }).int("Debe ser un número entero").min(5, "Mínimo 5 minutos").max(480, "Máximo 480 minutos"),
  precio: z.number({ message: "El precio es obligatorio" }).min(0, "El precio no puede ser negativo"),
});

export const actualizarServicioSchema = z.object({
  nombre: z.string({ message: "El nombre es obligatorio" }).min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres").optional(),
  descripcion: z.string({ message: "La descripción es obligatoria" }).max(500, "Máximo 500 caracteres").optional(),
  duracion_minutos: z.number({ message: "La duración es obligatoria" }).int("Debe ser un número entero").min(5, "Mínimo 5 minutos").max(480, "Máximo 480 minutos").optional(),
  precio: z.number({ message: "El precio es obligatorio" }).min(0, "El precio no puede ser negativo").optional(),
  activo: z.boolean().optional(),
});
