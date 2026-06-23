import "dotenv/config";

export const ENTORNO = {
  PORT: Number(process.env.PORT ?? 3000),
  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: Number(process.env.DB_PORT ?? 3307),
  DB_USUARIO: process.env.DB_USUARIO ?? "root",
  DB_CONTRASENA: process.env.DB_CONTRASENA ?? "root",
  DB_NOMBRE: process.env.DB_NOMBRE ?? "peluqueria",
  JWT_SECRETO: process.env.JWT_SECRETO ?? "secreto-desarrollo-peluqueria",
  JWT_EXPIRACION: process.env.JWT_EXPIRACION ?? "24h",
  // Mailtrap API (prioritario sobre SMTP)
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN ?? "",
  // SMTP tradicional (fallback si no hay Mailtrap)
  MAIL_HOST: process.env.MAIL_HOST ?? "",
  MAIL_PORT: Number(process.env.MAIL_PORT ?? 587),
  MAIL_USUARIO: process.env.MAIL_USUARIO ?? "",
  MAIL_PASS: process.env.MAIL_PASS ?? "",
  MAIL_FROM: process.env.MAIL_FROM ?? "hello@demomailtrap.co",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
};
