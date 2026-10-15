import { CARTA_IDS, type CartaInfo } from '../content/cartas';
import type { Carta } from '../services/seccionesService';
import type { CartaId, SeccionConPlatos } from '../types';

/** Cuántos platos tiene cada carta (para las pestañas). */
export function cantidadesPorCarta(data: Carta | null): Partial<Record<CartaId, number>> | undefined {
  if (!data) return undefined;
  return Object.fromEntries(
    CARTA_IDS.map((id) => [id, data.porCarta[id].reduce((n, s) => n + s.platosDetalle.length, 0)])
  );
}

/** Lee la carta elegida de la URL (?carta=colazione); si no hay, la del restaurante. */
export function cartaDesdeParametro(valor: string | null): CartaId {
  return CARTA_IDS.find((id) => id.toLowerCase() === valor) ?? 'RISTORANTE';
}

/** id del ancla de cada sección, para el índice "En esta carta". */
export function idSeccion(carta: CartaInfo, seccion: SeccionConPlatos): string {
  return `carta-${carta.id.toLowerCase()}-${seccion.id}`;
}
