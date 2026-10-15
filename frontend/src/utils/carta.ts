import { CARTAS, type CartaInfo } from '../content/cartas';
import type { Carta } from '../services/seccionesService';
import type { CartaId, SeccionConPlatos } from '../types';

/** Cuántos platos tiene cada carta (para las pestañas). */
export function cantidadesPorCarta(data: Carta | null): Partial<Record<CartaId, number>> | undefined {
  if (!data) return undefined;
  return Object.fromEntries(
    CARTAS.map((c) => [c.id, data.porCarta[c.id].reduce((n, s) => n + s.platosDetalle.length, 0)])
  );
}

/** Lee la carta elegida de la URL (?carta=colazione); si no hay, la del restaurante. */
export function cartaDesdeParametro(valor: string | null): CartaId {
  return CARTAS.find((c) => c.id.toLowerCase() === valor)?.id ?? 'RISTORANTE';
}

/** id del ancla de cada sección, para el índice "En esta carta". */
export function idSeccion(carta: CartaInfo, seccion: SeccionConPlatos): string {
  return `carta-${carta.id.toLowerCase()}-${seccion.id}`;
}
