import { api } from './api';
import type { Mesa, MesaInput } from '../types';

const RUTA = '/mesas';

export function getMesas(): Promise<Mesa[]> {
  return api.get<Mesa[]>(RUTA);
}

export function createMesa(datos: MesaInput): Promise<Mesa> {
  return api.post<Mesa>(RUTA, datos);
}

export function updateMesa(id: number, cambios: Partial<MesaInput>): Promise<Mesa> {
  return api.put<Mesa>(`${RUTA}/${id}`, cambios);
}

export function deleteMesa(id: number): Promise<Mesa> {
  return api.delete<Mesa>(`${RUTA}/${id}`);
}
