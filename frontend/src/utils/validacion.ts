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

/** Entre 8 y 15 números; se aceptan espacios, guiones, paréntesis y el +. */
export function validarTelefono(valor: string): string {
  if (!valor.trim()) return 'Dejanos un teléfono para avisarte si pasa algo.';
  const digitos = valor.replace(/[\s()+-]/g, '');
  if (!/^\d{8,15}$/.test(digitos)) return 'Revisá el teléfono: tiene que tener entre 8 y 15 números.';
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
