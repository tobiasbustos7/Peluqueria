import type { RowDataPacket } from "mysql2";
import pool from "../config/base-datos.js";

interface SlotDisponible {
  empleado_id: number;
  empleado_nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

export async function obtenerDisponibilidad(servicio_id: number, fecha: string, empleado_id?: number) {
  const diaSemana = new Date(fecha + "T12:00:00").getDay();

  const ahora = new Date();
  const hoyStr = ahora.toISOString().split("T")[0];
  const inicioMinimo = fecha === hoyStr ? ahora.getHours() * 60 + ahora.getMinutes() : undefined;

  let horariosQuery = `
    SELECT h.*, e.nombre AS empleado_nombre
    FROM horarios h
    JOIN empleados e ON e.id = h.empleado_id
    WHERE h.dia_semana = ? AND h.activo = TRUE AND e.activo = TRUE AND e.rol = 'empleado'
  `;
  const horariosParams: unknown[] = [diaSemana];

  if (empleado_id) {
    horariosQuery += " AND h.empleado_id = ?";
    horariosParams.push(empleado_id);
  }

  const [servicioRows] = await pool.execute<RowDataPacket[]>(
    "SELECT duracion_minutos FROM servicios WHERE id = ? AND activo = TRUE",
    [servicio_id],
  );

  if (servicioRows.length === 0) {
    return [];
  }

  const duracionMinutos = servicioRows[0].duracion_minutos as number;

  const [horarios] = await pool.execute<RowDataPacket[]>(horariosQuery, horariosParams);

  if (horarios.length === 0) {
    return [];
  }

  const [turnosExistentes] = await pool.execute<RowDataPacket[]>(
    `SELECT empleado_id, hora_inicio, hora_fin FROM turnos
     WHERE fecha = ? AND estado IN ('pendiente', 'confirmado')`,
    [fecha],
  );

  const slots: SlotDisponible[] = [];

  for (const horario of horarios) {
    const ocupados = turnosExistentes
      .filter((t: RowDataPacket) => t.empleado_id === horario.empleado_id)
      .map((t: RowDataPacket) => ({
        inicio: t.hora_inicio as string,
        fin: t.hora_fin as string,
      }));

    const slotsDelDia = generarSlots(
      horario.hora_apertura as string,
      horario.hora_cierre as string,
      duracionMinutos,
      ocupados,
      inicioMinimo,
    );

    for (const slot of slotsDelDia) {
      slots.push({
        empleado_id: horario.empleado_id as number,
        empleado_nombre: horario.empleado_nombre as string,
        hora_inicio: slot.inicio,
        hora_fin: slot.fin,
      });
    }
  }

  slots.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return slots;
}

function generarSlots(
  apertura: string,
  cierre: string,
  duracion: number,
  ocupados: { inicio: string; fin: string }[],
  inicioMinimo?: number,
) {
  const slots: { inicio: string; fin: string }[] = [];
  const [hApertura, mApertura] = apertura.split(":").map(Number);
  const [hCierre, mCierre] = cierre.split(":").map(Number);
  const aperturaMin = hApertura * 60 + mApertura;
  const cierreMin = hCierre * 60 + mCierre;

  const ocupadosMin = ocupados.map((o) => {
    const [hI, mI] = o.inicio.split(":").map(Number);
    const [hF, mF] = o.fin.split(":").map(Number);
    return { inicio: hI * 60 + mI, fin: hF * 60 + mF };
  });

  const inicioReal = inicioMinimo !== undefined ? Math.max(aperturaMin, Math.ceil(inicioMinimo / 30) * 30) : aperturaMin;

  for (let inicio = inicioReal; inicio + duracion <= cierreMin; inicio += 30) {
    const fin = inicio + duracion;
    const disponible = !ocupadosMin.some((o) => inicio < o.fin && fin > o.inicio);

    if (disponible) {
      const hI = String(Math.floor(inicio / 60)).padStart(2, "0");
      const mI = String(inicio % 60).padStart(2, "0");
      const hF = String(Math.floor(fin / 60)).padStart(2, "0");
      const mF = String(fin % 60).padStart(2, "0");
      slots.push({ inicio: `${hI}:${mI}`, fin: `${hF}:${mF}` });
    }
  }

  return slots;
}
