import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ENTORNO, detectarProduccion } from "./config/entorno.js";
import pool from "./config/base-datos.js";
import { iniciarWorkerRecordatorios } from "./utilidades/notificaciones.js";
import rutasAutenticacion from "./rutas/autenticacion.rutas.js";
import rutasServicios from "./rutas/servicios.rutas.js";
import rutasHorarios from "./rutas/horarios.rutas.js";
import rutasTurnos from "./rutas/turnos.rutas.js";
import rutasFidelizacion from "./rutas/fidelizacion.rutas.js";
import rutasEmpleados from "./rutas/empleados.rutas.js";
import rutasEstadisticas from "./rutas/estadisticas.rutas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

const DIST_PATH = path.join(__dirname, "..", "dist");

if (detectarProduccion()) {
  app.use(express.static(DIST_PATH));
}

app.get("/api/health", (_req, res) => {
  res.json({ estado: "ok" });
});

app.use("/api/autenticacion", rutasAutenticacion);
app.use("/api/servicios", rutasServicios);
app.use("/api/horarios", rutasHorarios);
app.use("/api/turnos", rutasTurnos);
app.use("/api/fidelizacion", rutasFidelizacion);
app.use("/api/empleados", rutasEmpleados);
app.use("/api/estadisticas", rutasEstadisticas);

if (detectarProduccion()) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(DIST_PATH, "index.html"));
  });
}

async function inicializarBaseDeDatos() {
  try {
    const rutaSQL = path.join(__dirname, "config", "init.sql");
    const sql = await fs.readFile(rutaSQL, "utf-8");

    const sqlLimpio = sql.replace(/--.*$/gm, "").trim();
    const sentencias = sqlLimpio
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sentencia of sentencias) {
      await pool.query(sentencia);
    }

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar base de datos:", error);
    throw error;
  }
}

async function iniciarServidor() {
  await inicializarBaseDeDatos();

  iniciarWorkerRecordatorios();

  app.listen(ENTORNO.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${ENTORNO.PORT}`);
  });
}

iniciarServidor();
