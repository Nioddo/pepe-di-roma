/** Si el local está abierto ahora, leído del horario que carga el admin ("8:30 a 00 h"). */

export interface EstadoLocal {
  abierto: boolean;
  /** "hasta las 00 h", "abre a las 8:30". */
  detalle: string;
}

const minutos = (hora: string, min?: string) => (Number(hora) % 24) * 60 + Number(min ?? 0);

const comoHora = (m: number) => {
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h}:${String(resto).padStart(2, '0')}` : `${String(h).padStart(h === 0 ? 2 : 1, '0')} h`;
};

const hasta = (m: number) => (Math.floor(m / 60) === 1 ? `hasta la ${comoHora(m)}` : `hasta las ${comoHora(m)}`);

/**
 * @param horario texto del horario de todos los días: "8:30 a 00 h"
 * @param extendido texto del horario extendido de viernes y sábados: "… hasta la 1". Vacío si no hay.
 * @returns null si el horario no se puede leer: mejor no decir nada que decir algo falso.
 */
export function estadoDelLocal(horario: string, extendido: string, ahora = new Date()): EstadoLocal | null {
  const rango = horario.match(/(\d{1,2})(?::(\d{2}))?\s*a\s*(\d{1,2})(?::(\d{2}))?/);
  if (!rango) return null;

  const abre = minutos(rango[1], rango[2]);
  const cierra = minutos(rango[3], rango[4]);
  const extra = extendido.match(/hasta las? (\d{1,2})(?::(\d{2}))?/i);
  const cierraTarde = extra ? minutos(extra[1], extra[2]) : null;

  // el cierre de un día: viernes (5) y sábado (6) usan el horario extendido
  const cierreDe = (dia: number) => (cierraTarde !== null && (dia === 5 || dia === 6) ? cierraTarde : cierra);
  // un cierre antes de la apertura cae en la madrugada del día siguiente
  const pasaMedianoche = (cierre: number) => cierre <= abre;

  const dia = ahora.getDay();
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = cierreDe(dia);
  const ayer = cierreDe((dia + 6) % 7);

  if (pasaMedianoche(ayer) && m < ayer) return { abierto: true, detalle: hasta(ayer) };
  if (m >= abre && (pasaMedianoche(hoy) || m < hoy)) return { abierto: true, detalle: hasta(hoy) };
  return { abierto: false, detalle: `abre a las ${comoHora(abre)}` };
}
