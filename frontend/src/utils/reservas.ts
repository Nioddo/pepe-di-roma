import { aMinutos, deMinutos } from './formato';
import type { Reserva } from '../types';

export const DURACION_MIN = 120;

/** Hasta este tamaño, el cliente elige la mesa en el mapa. */
export const MAX_ELIGE_MESA = 4;

/** Más de este tamaño no se puede reservar online. */
export const MAX_ONLINE = 12;

export type ReglaGrupo = 'elige-mesa' | 'asigna-local' | 'no-online';

export function reglaPara(integrantes: number): ReglaGrupo {
  if (integrantes > MAX_ONLINE) return 'no-online';
  if (integrantes > MAX_ELIGE_MESA) return 'asigna-local';
  return 'elige-mesa';
}

/**
 * Turnos de 30 minutos. El local abre todos los días de 8:30 a 00 h y los viernes
 * y sábados hasta la 1: como la reserva dura 2 h, el último turno empieza 2 h antes del cierre.
 */
export function horarios(fecha?: string): string[] {
  const dia = fecha ? new Date(`${fecha}T12:00:00`).getDay() : -1;
  const cierre = dia === 5 || dia === 6 ? 25 * 60 : 24 * 60;
  const salida: string[] = [];
  for (let m = 8 * 60 + 30; m <= cierre - DURACION_MIN; m += 30) salida.push(deMinutos(m));
  return salida;
}

/** Misma regla de solapamiento que aplica el backend (ReservaService.validarDisponibilidad). */
export function mesaOcupada(
  mesaId: number,
  fecha: string,
  hora: string,
  reservas: Reserva[],
  excluirId?: number
): boolean {
  const inicio = aMinutos(hora);
  const fin = inicio + DURACION_MIN;

  return reservas.some((r) => {
    if (r.id === excluirId || r.estado === 'CANCELADA') return false;
    if (r.mesaId !== mesaId || r.fecha !== fecha) return false;
    const otroInicio = aMinutos(r.horaInicio);
    const otroFin = otroInicio + (r.duracionMin || DURACION_MIN);
    return inicio < otroFin && otroInicio < fin;
  });
}
