import "dotenv/config";

function parseMysqlUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

export function detectarProduccion(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "prod" ||
    !!process.env.RAILWAY_SERVICE_NAME ||
    !!process.env.RAILWAY_SERVICE_ID
  );
}

const mysqlUrl = process.env.MYSQL_URL ? parseMysqlUrl(process.env.MYSQL_URL) : null;

export const ENTORNO = {
  PORT: Number(process.env.PORT ?? 3000),
  DB_HOST: mysqlUrl?.host ?? process.env.MYSQLHOST ?? process.env.DB_HOST ?? "localhost",
  DB_PORT: mysqlUrl?.port ?? Number(process.env.MYSQLPORT ?? process.env.DB_PORT ?? 3306),
  DB_USUARIO: mysqlUrl?.user ?? process.env.MYSQLUSER ?? process.env.DB_USUARIO ?? "root",
  DB_CONTRASENA: mysqlUrl?.password ?? process.env.MYSQLPASSWORD ?? process.env.DB_CONTRASENA ?? "root",
  DB_NOMBRE: mysqlUrl?.database ?? process.env.MYSQLDATABASE ?? process.env.DB_NOMBRE ?? "peluqueria",
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
  FRONTEND_URL: process.env.FRONTEND_URL ?? (detectarProduccion() ? "" : "http://localhost:5173"),
};
