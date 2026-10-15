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

// El backend no expone un endpoint de login: se busca la cuenta por email
// y se valida con el DNI, que es el dato que guarda cada usuario.
export async function findUsuarioByEmail(email: string): Promise<Usuario | undefined> {
  const usuarios = await getUsuarios();
  const buscado = email.trim().toLowerCase();
  return usuarios.find((u) => u.email.toLowerCase() === buscado);
}
