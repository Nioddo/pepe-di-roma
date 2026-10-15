import { api } from './api';
import { getPlatos } from './platosService';
import type { CartaId, Plato, Seccion, SeccionConPlatos, SeccionInput } from '../types';

const RUTA = '/secciones';

export function getSecciones(): Promise<Seccion[]> {
  return api.get<Seccion[]>(RUTA);
}

export function createSeccion(datos: SeccionInput): Promise<Seccion> {
  return api.post<Seccion>(RUTA, datos);
}

export function updateSeccion(id: number, cambios: Partial<SeccionInput>): Promise<Seccion> {
  return api.put<Seccion>(`${RUTA}/${id}`, cambios);
}

export function deleteSeccion(id: number): Promise<Seccion> {
  return api.delete<Seccion>(`${RUTA}/${id}`);
}

export interface Carta {
  secciones: SeccionConPlatos[];
  sinSeccion: Plato[];
  platos: Plato[];
  /** Las secciones de cada una de las tres cartas, en orden. */
  porCarta: Record<CartaId, SeccionConPlatos[]>;
}

// La API guarda en cada sección solo los IDs de sus platos:
// acá se cruzan las dos colecciones y se ordenan por el campo "orden".
export async function getCarta(): Promise<Carta> {
  const [secciones, platos] = await Promise.all([getSecciones(), getPlatos()]);
  const porId = new Map(platos.map((p) => [p.id, p]));

  const conPlatos = secciones
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((s) => ({
      ...s,
      platosDetalle: s.platos.map((id) => porId.get(id)).filter((p): p is Plato => Boolean(p))
    }));

  const enAlgunaSeccion = new Set(secciones.flatMap((s) => s.platos));
  const sinSeccion = platos.filter((p) => !enAlgunaSeccion.has(p.id));

  const porCarta: Record<CartaId, SeccionConPlatos[]> = { RISTORANTE: [], PER_PORTARE_VIA: [], COLAZIONE: [] };
  conPlatos.forEach((s) => porCarta[s.carta]?.push(s));

  return { secciones: conPlatos, sinSeccion, platos, porCarta };
}
