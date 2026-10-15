import type { Usuario } from '../types';

const CLAVE = 'pepediroma.sesion';

export function leerSesion(): Usuario | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Usuario) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario: Usuario | null): void {
  try {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento disponible: la sesión dura lo que dure la pestaña.
  }
}

export function esPersonal(usuario: Usuario | null): boolean {
  return usuario?.rol === 'ADMIN' || usuario?.rol === 'EMPLEADO';
}
