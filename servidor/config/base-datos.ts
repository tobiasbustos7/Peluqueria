import mysql from "mysql2/promise";
import { ENTORNO } from "./entorno.js";

const pool = mysql.createPool({
  host: ENTORNO.DB_HOST,
  port: ENTORNO.DB_PORT,
  user: ENTORNO.DB_USUARIO,
  password: ENTORNO.DB_CONTRASENA,
  database: ENTORNO.DB_NOMBRE,
  charset: "UTF8MB4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export default pool;
