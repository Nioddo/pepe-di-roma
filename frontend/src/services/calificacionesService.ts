import { api } from './api';
import type { Calificacion, CalificacionCambios, CalificacionInput } from '../types';

const RUTA = '/calificaciones';

export function getCalificaciones(): Promise<Calificacion[]> {
  return api.get<Calificacion[]>(RUTA);
}

/** Las que se muestran en la portada, de la más nueva a la más vieja. */
export async function getCalificacionesPublicas(): Promise<Calificacion[]> {
  const todas = await getCalificaciones();
  return todas.filter((c) => c.visible).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

export function createCalificacion(datos: CalificacionInput): Promise<Calificacion> {
  return api.post<Calificacion>(RUTA, datos);
}

export function updateCalificacion(id: number, cambios: CalificacionCambios): Promise<Calificacion> {
  return api.put<Calificacion>(`${RUTA}/${id}`, cambios);
}

export function deleteCalificacion(id: number): Promise<Calificacion> {
  return api.delete<Calificacion>(`${RUTA}/${id}`);
}
