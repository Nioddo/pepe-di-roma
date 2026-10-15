const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const precio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

export function formatearPrecio(valor: number): string {
  return precio.format(valor);
}

const monto = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** Solo el número, como en la carta impresa: el signo va en su propia columna. */
export function formatearMonto(valor: number): string {
  return monto.format(valor);
}

/** "2026-07-10" → "10/07" */
export function formatearFecha(fecha: string): string {
  const [, mes, dia] = fecha.split('-');
  return `${dia}/${mes}`;
}

/** "2026-07-10" → "10" */
export function diaDe(fecha: string): string {
  return String(Number(fecha.split('-')[2]));
}

/** "2026-07-10" → "jul" */
export function mesDe(fecha: string): string {
  return MESES[Number(fecha.split('-')[1]) - 1] ?? '';
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function deMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function plural(n: number, singular: string, pluralTexto = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

/** Fecha de hoy en formato YYYY-MM-DD según la zona horaria local. */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
