import { z } from "zod/v4";

export const crearTurnoSchema = z.object({
  servicio_id: z.number({ message: "El servicio es obligatorio" }).int(),
  empleado_id: z.number({ message: "El empleado es obligatorio" }).int(),
  fecha: z.string({ message: "La fecha es obligatoria" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  hora_inicio: z.string({ message: "La hora de inicio es obligatoria" }).regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  observaciones: z.string().max(500).optional().default(""),
});

export const cambiarEstadoTurnoSchema = z.object({
  estado: z.enum(["pendiente", "confirmado", "cancelado", "completado"], {
    message: "Estado inválido",
  }),
});
