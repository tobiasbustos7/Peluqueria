import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { ENTORNO } from "../config/entorno.js";

let transportador: nodemailer.Transporter | null = null;

function obtenerTransportador() {
  if (transportador) return transportador;

  if (ENTORNO.MAILTRAP_TOKEN) {
    transportador = nodemailer.createTransport(
      MailtrapTransport({ token: ENTORNO.MAILTRAP_TOKEN }),
    );
    return transportador;
  }

  if (ENTORNO.MAIL_HOST && ENTORNO.MAIL_USUARIO) {
    transportador = nodemailer.createTransport({
      host: ENTORNO.MAIL_HOST,
      port: ENTORNO.MAIL_PORT,
      secure: ENTORNO.MAIL_PORT === 465,
      auth: { user: ENTORNO.MAIL_USUARIO, pass: ENTORNO.MAIL_PASS },
    });
  }
  return transportador;
}

interface CorreoParams {
  para: string;
  asunto: string;
  texto: string;
  html?: string;
}

export async function enviarCorreo(params: CorreoParams) {
  const transporter = obtenerTransportador();

  if (!transporter) {
    console.log(`[EMAIL SIMULADO] Para: ${params.para} | Asunto: ${params.asunto}`);
    console.log(params.texto);
    return;
  }

  await transporter.sendMail({
    from: { email: ENTORNO.MAIL_FROM, name: "Peluquería" },
    to: params.para,
    subject: params.asunto,
    text: params.texto,
    html: params.html,
  });
}
