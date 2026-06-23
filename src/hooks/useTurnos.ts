import { useState, useEffect, useCallback } from "react";
import * as turnoApi from "../api/turno-api";
import type { Turno } from "../tipos";

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTurnos = useCallback(async () => {
    try {
      setCargando(true);
      const datos = await turnoApi.listarTurnos();
      setTurnos(datos);
    } catch (err: unknown) {
      const errorApi = err as { mensaje?: string };
      setError(errorApi.mensaje ?? "Error al cargar turnos");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTurnos();
  }, [cargarTurnos]);

  return { turnos, cargando, error, recargar: cargarTurnos, setTurnos };
}
