import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/base-datos.js";
import { enviarCorreo } from "../utilidades/correo.js";

interface TurnoPendienteRecordatorio {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string;
  empleado_nombre: string;
  servicio_nombre: string;
  fecha: string;
  hora_inicio: string;
}

export async function obtenerConfignotificaciones() {
  const [filas] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM confignotificaciones ORDER BY id LIMIT 1",
  );
  return filas[0] as { id: number; horas_antes: number; activo: boolean } | undefined;
}

export async function actualizarConfignotificaciones(datos: { horas_antes: number; activo: boolean }) {
  const [existente] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM confignotificaciones LIMIT 1",
  );

  if (existente.length > 0) {
    await pool.execute<ResultSetHeader>(
      "UPDATE confignotificaciones SET horas_antes = ?, activo = ? WHERE id = ?",
      [datos.horas_antes, datos.activo, existente[0].id],
    );
  } else {
    await pool.execute<ResultSetHeader>(
      "INSERT INTO confignotificaciones (horas_antes, activo) VALUES (?, ?)",
      [datos.horas_antes, datos.activo],
    );
  }

  return obtenerConfignotificaciones();
}

async function asegurarColumnaRecordatorio() {
  try {
    await pool.execute("ALTER TABLE turnos ADD COLUMN recordatorio_enviado BOOLEAN DEFAULT FALSE");
    console.log("Columna recordatorio_enviado agregada a turnos");
  } catch {
    // ya existe, ignorar
  }
}

async function obtenerTurnosParaRecordatorio(horasAntes: number) {
  const [filas] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id, t.cliente_id, c.nombre AS cliente_nombre, c.email AS cliente_email,
            e.nombre AS empleado_nombre, s.nombre AS servicio_nombre,
            t.fecha, t.hora_inicio
     FROM turnos t
     JOIN clientes c ON c.id = t.cliente_id
     JOIN empleados e ON e.id = t.empleado_id
     JOIN servicios s ON s.id = t.servicio_id
     WHERE t.estado IN ('pendiente', 'confirmado')
       AND (t.recordatorio_enviado IS NULL OR t.recordatorio_enviado = FALSE)
       AND CONCAT(t.fecha, ' ', t.hora_inicio) <= DATE_ADD(NOW(), INTERVAL ? HOUR)
       AND CONCAT(t.fecha, ' ', t.hora_inicio) > NOW()`,
    [horasAntes],
  );
  return filas as TurnoPendienteRecordatorio[];
}

function generarHtmlRecordatorio(turno: TurnoPendienteRecordatorio) {
  const fechaLocal = new Date(turno.fecha + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:20px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f59e0b,#e11d48);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Peluquería</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Recordatorio de turno</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px 40px;border-left:1px solid #e5e5e0;border-right:1px solid #e5e5e0">
          <p style="margin:0 0 20px;font-size:15px;color:#44403c;line-height:1.6">
            Hola <strong style="color:#1c1917">${turno.cliente_nombre}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#44403c;line-height:1.6">
            Te recordamos que tenés un turno agendado:
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border-radius:12px;padding:20px;margin-bottom:24px">
            <tr><td style="padding:6px 0"><span style="color:#a8a29e;font-size:13px">Servicio</span><br><span style="color:#1c1917;font-size:15px;font-weight:600">${turno.servicio_nombre}</span></td></tr>
            <tr><td style="padding:6px 0"><span style="color:#a8a29e;font-size:13px">Empleado</span><br><span style="color:#1c1917;font-size:15px;font-weight:600">${turno.empleado_nombre}</span></td></tr>
            <tr><td style="padding:6px 0"><span style="color:#a8a29e;font-size:13px">Fecha</span><br><span style="color:#1c1917;font-size:15px;font-weight:600">${fechaLocal}</span></td></tr>
            <tr><td style="padding:6px 0"><span style="color:#a8a29e;font-size:13px">Horario</span><br><span style="color:#1c1917;font-size:15px;font-weight:600">${turno.hora_inicio.slice(0, 5)}</span></td></tr>
          </table>

          <p style="margin:0;font-size:15px;color:#44403c;line-height:1.6">Te esperamos</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafaf9;border-radius:0 0 16px 16px;border:1px solid #e5e5e0;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a8a29e">© ${new Date().getFullYear()} Peluquería · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function enviarSimulacionEmail(turno: TurnoPendienteRecordatorio) {
  const mensaje = [
    `═══════════════════════════════════════════════════`,
    `  RECORDATORIO DE TURNO`,
    `  Para:      ${turno.cliente_nombre} <${turno.cliente_email}>`,
    `  Servicio:  ${turno.servicio_nombre}`,
    `  Empleado:  ${turno.empleado_nombre}`,
    `  Fecha:     ${turno.fecha}`,
    `  Horario:   ${turno.hora_inicio.slice(0, 5)}`,
    `═══════════════════════════════════════════════════`,
  ].join("\n");

  console.log(mensaje);

  enviarCorreo({
    para: turno.cliente_email,
    asunto: "Recordatorio de turno - Peluquería",
    texto: `Hola ${turno.cliente_nombre},\n\nTe recordamos que tienes un turno:\n\nServicio: ${turno.servicio_nombre}\nEmpleado: ${turno.empleado_nombre}\nFecha: ${turno.fecha}\nHorario: ${turno.hora_inicio.slice(0, 5)}\n\nTe esperamos.`,
    html: generarHtmlRecordatorio(turno),
  });
}

export async function procesarRecordatorios(horasAntes: number) {
  await asegurarColumnaRecordatorio();
  const turnos = await obtenerTurnosParaRecordatorio(horasAntes);

  if (turnos.length === 0) return 0;

  for (const turno of turnos) {
    enviarSimulacionEmail(turno);
    await pool.execute<ResultSetHeader>(
      "UPDATE turnos SET recordatorio_enviado = TRUE WHERE id = ?",
      [turno.id],
    );
  }

  console.log(`Recordatorios enviados: ${turnos.length}`);
  return turnos.length;
}
