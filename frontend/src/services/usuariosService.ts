import { api } from './api';
import type { Usuario, UsuarioInput } from '../types';

const RUTA = '/usuarios';

export function getUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>(RUTA);
}

export function getUsuario(id: number): Promise<Usuario> {
  return api.get<Usuario>(`${RUTA}/${id}`);
}

export function createUsuario(datos: UsuarioInput): Promise<Usuario> {
  return api.post<Usuario>(RUTA, datos);
}

export function updateUsuario(id: number, cambios: Partial<UsuarioInput>): Promise<Usuario> {
  return api.put<Usuario>(`${RUTA}/${id}`, cambios);
}

export function deleteUsuario(id: number): Promise<Usuario> {
  return api.delete<Usuario>(`${RUTA}/${id}`);
}

export function loginUsuario(email: string, dni: string): Promise<Usuario> {
  return api.post<Usuario>(`${RUTA}/login`, { email: email.trim(), dni: dni.trim() });
}
