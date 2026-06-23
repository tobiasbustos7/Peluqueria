import { obtenerConfignotificaciones, procesarRecordatorios } from "../servicios/notificacion.servicio.js";

let intervalo: ReturnType<typeof setInterval> | null = null;

export function iniciarWorkerRecordatorios() {
  if (intervalo) return;

  async function ejecutar() {
    try {
      const config = await obtenerConfignotificaciones();
      if (!config || !config.activo) return;

      await procesarRecordatorios(config.horas_antes);
    } catch (error) {
      console.error("Error en worker de recordatorios:", error);
    }
  }

  ejecutar();

  intervalo = setInterval(ejecutar, 60_000);
  console.log("Worker de recordatorios iniciado (cada 60s)");
}

export function detenerWorkerRecordatorios() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }
}
