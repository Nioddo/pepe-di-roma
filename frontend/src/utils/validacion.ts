// Validaciones de formularios. Devuelven el mensaje de error o '' si el valor es válido.
// Replican las reglas del backend para avisar antes de enviar.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI = /^\d{7,8}$/;

export type Errores<K extends string> = Partial<Record<K, string>>;

export function validarEmail(valor: string): string {
  if (!valor.trim()) return 'Ingresá tu email.';
  if (!EMAIL.test(valor.trim())) return 'Revisá el email: falta la @ o el dominio.';
  return '';
}

export function validarDni(valor: string): string {
  if (!valor.trim()) return 'Ingresá tu DNI.';
  if (!DNI.test(valor.trim())) return 'El DNI tiene 7 u 8 números, sin puntos.';
  return '';
}

export function validarRequerido(valor: string, mensaje: string): string {
  return valor.trim() ? '' : mensaje;
}

export function validarPrecio(valor: string): string {
  if (!valor.trim()) return 'Indicá el precio.';
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return 'El precio tiene que ser un número mayor a 0.';
  return '';
}

export function hayErrores<K extends string>(errores: Errores<K>): boolean {
  return Object.values(errores).some(Boolean);
}
