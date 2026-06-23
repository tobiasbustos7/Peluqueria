import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAutenticacion } from "../hooks/useAutenticacion";
import { listarTurnos } from "../api/turno-api";
import { obtenerMisVisitas } from "../api/fidelizacion-api";
import type { Turno } from "../tipos";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const BADGE_ROL: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  empleado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cliente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const BADGE_ESTADO: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  completado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function formatearHora(h: string) {
  const [hh, mm] = h.split(":");
  return `${hh}:${mm}`;
}

function esHoy(fecha: string) {
  const hoy = new Date();
  const f = new Date(fecha + "T00:00:00");
  return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth() && f.getDate() === hoy.getDate();
}

interface CardResumenProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color: string;
}

function CardResumen({ titulo, valor, icono, color }: CardResumenProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
        {icono}
      </div>
      <div>
        <p className="text-sm text-stone-500 dark:text-stone-400">{titulo}</p>
        <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{valor}</p>
      </div>
    </div>
  );
}

interface AccionRapidaProps {
  to: string;
  label: string;
  descripcion: string;
  icono: React.ReactNode;
}

function AccionRapida({ to, label, descripcion, icono }: AccionRapidaProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
        {icono}
      </div>
      <div>
        <p className="font-medium text-stone-800 dark:text-stone-100">{label}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{descripcion}</p>
      </div>
    </Link>
  );
}

function FilaTurno({ turno }: { turno: Turno }) {
  const f = new Date(turno.fecha + "T00:00:00");
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-stone-700 shadow-sm">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{f.getDate()}</span>
          <span className="text-[10px] font-medium text-stone-400 uppercase">{MESES[f.getMonth()].slice(0, 3)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
            {formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Servicio #{turno.servicio_id}</p>
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_ESTADO[turno.estado]}`}>
        {turno.estado}
      </span>
    </div>
  );
}

export default function PanelControl() {
  const { usuario } = useAutenticacion();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [visitas, setVisitas] = useState<{ visitas_acumuladas: number; visitas_requeridas: number; progreso: number; beneficio_activo: boolean } | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [turnosRes] = await Promise.all([
          listarTurnos(),
          usuario?.rol === "cliente" ? obtenerMisVisitas().catch(() => null) : Promise.resolve(null),
        ]);
        setTurnos(turnosRes as Turno[]);
        if (usuario?.rol === "cliente") {
          setVisitas(await obtenerMisVisitas().catch(() => null));
        }
      } catch {
        // ignore
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [usuario]);

  const turnosHoy = turnos.filter((t) => esHoy(t.fecha) && t.estado !== "cancelado");
  const turnosProximos = turnos
    .filter((t) => t.estado === "pendiente" || t.estado === "confirmado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio))
    .slice(0, 5);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 dark:border-stone-700 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Bienvenido{usuario?.nombre ? `, ${usuario.nombre}` : ""}
          </h1>
          <span className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${usuario ? BADGE_ROL[usuario.rol] : ""}`}>
            {usuario?.rol}
          </span>
        </div>
        <p className="text-stone-500 dark:text-stone-400">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {usuario?.rol !== "cliente" ? (
          <>
            <CardResumen
              titulo="Turnos hoy"
              valor={turnosHoy.length}
              color="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <CardResumen
              titulo="Próximos"
              valor={turnosProximos.length}
              color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
          </>
        ) : (
          <>
            <CardResumen
              titulo="Mis turnos"
              valor={turnos.filter((t) => t.estado !== "cancelado").length}
              color="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <CardResumen
              titulo="Visitas"
              valor={visitas?.visitas_acumuladas ?? 0}
              color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
          </>
        )}
        <CardResumen
          titulo="Próximo turno"
          valor={turnosProximos[0] ? formatearHora(turnosProximos[0].hora_inicio) : "—"}
          color="bg-rose-100 dark:bg-rose-900/30 text-rose-600"
          icono={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acciones rápidas */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            {usuario?.rol === "cliente" ? (
              <AccionRapida
                to="/mis-turnos"
                label="Nuevo turno"
                descripcion="Agenda una cita con tu peluquero"
                icono={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
              />
            ) : (
              <AccionRapida
                to="/turnos"
                label="Ver turnos"
                descripcion="Gestiona los turnos del calendario"
                icono={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
            )}
            <AccionRapida
              to="/servicios"
              label="Servicios"
              descripcion="Ver lista de servicios disponibles"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 14.6L14.6 20.8C14 21.4 13 21.4 12.4 20.8L3.2 11.6C2.9 11.3 2.8 10.9 2.8 10.5L2.8 4.5C2.8 3.7 3.5 3 4.3 3L10.3 3C10.7 3 11.1 3.1 11.4 3.4L20.6 12.6C21.2 13.2 21.2 14 20.8 14.6Z" />
                  <circle cx="6.5" cy="6.5" r="1.5" />
                </svg>
              }
            />
            <AccionRapida
              to="/fidelizacion"
              label="Fidelización"
              descripcion={usuario?.rol === "cliente" ? "Tu progreso y beneficios" : "Configurar programa"}
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
            {usuario?.rol !== "cliente" && (
              <AccionRapida
                to="/horarios"
                label="Horarios"
                descripcion="Configurar horarios de empleados"
                icono={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
            )}
          </div>

          {/* Barra de fidelización para clientes */}
          {usuario?.rol === "cliente" && visitas && (
            <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">Fidelización</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone-500 dark:text-stone-400">{visitas.visitas_acumuladas} / {visitas.visitas_requeridas} visitas</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">{visitas.progreso}%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${visitas.beneficio_activo ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(visitas.progreso, 100)}%` }}
                />
              </div>
              {visitas.beneficio_activo && (
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  ¡Beneficio activo! {visitas.visitas_requeridas} visitas alcanzadas.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lista de turnos */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
            {usuario?.rol !== "cliente" ? "Turnos de hoy" : "Tus próximos turnos"}
          </h2>
          {turnosHoy.length > 0 ? (
            <div className="space-y-2">
              {turnosHoy.map((t) => (
                <FilaTurno key={t.id} turno={t} />
              ))}
            </div>
          ) : turnosProximos.length > 0 ? (
            <div className="space-y-2">
              {turnosProximos.map((t) => (
                <FilaTurno key={t.id} turno={t} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 dark:text-stone-600 mb-3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-stone-500 dark:text-stone-400 font-medium">No hay turnos próximos</p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                {usuario?.rol === "cliente" ? "Agenda tu primer turno para empezar" : "Los turnos aparecerán aquí cuando los clientes agenden"}
              </p>
              {usuario?.rol === "cliente" && (
                <Link
                  to="/mis-turnos"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Nuevo turno
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
