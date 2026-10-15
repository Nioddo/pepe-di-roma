import { api } from './api';
import type { Plato, PlatoInput } from '../types';

const RUTA = '/platos';

export function getPlatos(): Promise<Plato[]> {
  return api.get<Plato[]>(RUTA);
}

export function createPlato(datos: PlatoInput): Promise<Plato> {
  return api.post<Plato>(RUTA, datos);
}

export function updatePlato(id: number, cambios: Partial<PlatoInput>): Promise<Plato> {
  return api.put<Plato>(`${RUTA}/${id}`, cambios);
}

export function deletePlato(id: number): Promise<Plato> {
  return api.delete<Plato>(`${RUTA}/${id}`);
}
