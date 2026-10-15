import { api } from './api';
import type { Contenido } from '../types';

const RUTA = '/contenido';

export function getContenido(): Promise<Contenido[]> {
  return api.get<Contenido[]>(RUTA);
}

export function createContenido(clave: string, valor: string): Promise<Contenido> {
  return api.post<Contenido>(RUTA, { clave, valor });
}

export function updateContenido(id: number, valor: string): Promise<Contenido> {
  return api.put<Contenido>(`${RUTA}/${id}`, { valor });
}
