// Métricas del local calculadas sobre los pedidos, las reservas y las opiniones de la API.
// Son funciones puras: reciben los datos y el período, y devuelven números listos para mostrar.

import type { Calificacion, MetodoPago, Modalidad, Pedido, Plato, Reserva, Usuario } from '../types';

/** "2026-10" o "todo". */
export type Periodo = string;

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
/** Horas en que arranca una reserva: el local abre a las 8:30 y el último turno es a las 23. */
export const HORAS = Array.from({ length: 16 }, (_, i) => 8 + i);

const enPeriodo = (fecha: string, periodo: Periodo) => periodo === 'todo' || fecha.startsWith(periodo);
const fechaDePedido = (p: Pedido) => (p.creadoEn ?? '').slice(0, 10);

/** Lunes = 0 … Domingo = 6. */
export function diaSemana(fecha: string): number {
  return (new Date(`${fecha}T12:00:00`).getDay() + 6) % 7;
}

/** Los meses que tienen movimiento, del más nuevo al más viejo. */
export function mesesConDatos(pedidos: Pedido[], reservas: Reserva[]): string[] {
  const meses = new Set<string>();
  pedidos.forEach((p) => p.creadoEn && meses.add(p.creadoEn.slice(0, 7)));
  reservas.forEach((r) => meses.add(r.fecha.slice(0, 7)));
  return [...meses].sort().reverse();
}

export function mesAnterior(mes: string): string {
  const [anio, m] = mes.split('-').map(Number);
  return m === 1 ? `${anio - 1}-12` : `${anio}-${String(m - 1).padStart(2, '0')}`;
}

export function mesSiguiente(mes: string): string {
  const [anio, m] = mes.split('-').map(Number);
  return m === 12 ? `${anio + 1}-01` : `${anio}-${String(m + 1).padStart(2, '0')}`;
}

export interface Resumen {
  pedidos: number;
  facturacion: number;
  ticket: number;
  reservas: number;
  personas: number;
  canceladas: number;
  /** De 0 a 1. */
  cancelacion: number;
}

/**
 * Los números de arriba del panel. Los pedidos cancelados no suman ventas.
 * hastaDia recorta el mes (para comparar el mes en curso con los mismos días del anterior).
 */
export function resumen(pedidos: Pedido[], reservas: Reserva[], periodo: Periodo, hastaDia?: number): Resumen {
  const dentro = (fecha: string) => enPeriodo(fecha, periodo) && (hastaDia === undefined || Number(fecha.slice(8, 10)) <= hastaDia);
  const validos = pedidos.filter((p) => dentro(fechaDePedido(p)) && p.estado !== 'CANCELADO');
  const delPeriodo = reservas.filter((r) => dentro(r.fecha));
  const activas = delPeriodo.filter((r) => r.estado !== 'CANCELADA');
  const facturacion = validos.reduce((n, p) => n + p.precioTotal, 0);
  return {
    pedidos: validos.length,
    facturacion,
    ticket: validos.length ? Math.round(facturacion / validos.length) : 0,
    reservas: activas.length,
    personas: activas.reduce((n, r) => n + r.cantidadIntegrantes, 0),
    canceladas: delPeriodo.length - activas.length,
    cancelacion: delPeriodo.length ? (delPeriodo.length - activas.length) / delPeriodo.length : 0
  };
}

export interface PlatoPedido {
  platoId: number;
  nombre: string;
  unidades: number;
  monto: number;
  pedidos: number;
}

/** Los platos más pedidos por unidades vendidas (sin contar pedidos cancelados). */
export function platosMasPedidos(pedidos: Pedido[], periodo: Periodo): PlatoPedido[] {
  const mapa = new Map<number, PlatoPedido>();
  for (const p of pedidos) {
    if (p.estado === 'CANCELADO' || !enPeriodo(fechaDePedido(p), periodo)) continue;
    for (const it of p.items) {
      const fila = mapa.get(it.platoId) ?? { platoId: it.platoId, nombre: it.nombre, unidades: 0, monto: 0, pedidos: 0 };
      fila.unidades += it.cantidad;
      fila.monto += it.cantidad * it.precioUnitario;
      fila.pedidos += 1;
      mapa.set(it.platoId, fila);
    }
  }
  return [...mapa.values()].sort((a, b) => b.unidades - a.unidades || b.monto - a.monto);
}

export interface MapaReservas {
  /** celdas[día][índice de hora] = reservas activas que empiezan en esa hora. */
  celdas: number[][];
  maximo: number;
  porDia: number[];
  porHora: number[];
}

/** Cuántas reservas (sin canceladas) empiezan cada día de la semana y cada hora. */
export function mapaDeReservas(reservas: Reserva[], periodo: Periodo): MapaReservas {
  const celdas = DIAS_SEMANA.map(() => HORAS.map(() => 0));
  for (const r of reservas) {
    if (r.estado === 'CANCELADA' || !enPeriodo(r.fecha, periodo)) continue;
    const hora = HORAS.indexOf(Number(r.horaInicio.slice(0, 2)));
    if (hora >= 0) celdas[diaSemana(r.fecha)][hora] += 1;
  }
  return {
    celdas,
    maximo: Math.max(0, ...celdas.flat()),
    porDia: celdas.map((fila) => fila.reduce((n, v) => n + v, 0)),
    porHora: HORAS.map((_, h) => celdas.reduce((n, fila) => n + fila[h], 0))
  };
}

export interface DiaVentas {
  fecha: string;
  monto: number;
  pedidos: number;
}

/** Ventas de cada día del mes (los días sin pedidos quedan en cero). */
export function ventasPorDia(pedidos: Pedido[], mes: string): DiaVentas[] {
  const [anio, m] = mes.split('-').map(Number);
  const dias = new Date(anio, m, 0).getDate();
  const salida: DiaVentas[] = Array.from({ length: dias }, (_, i) => ({ fecha: `${mes}-${String(i + 1).padStart(2, '0')}`, monto: 0, pedidos: 0 }));
  for (const p of pedidos) {
    const fecha = fechaDePedido(p);
    if (p.estado === 'CANCELADO' || !fecha.startsWith(mes)) continue;
    const dia = salida[Number(fecha.slice(8, 10)) - 1];
    dia.monto += p.precioTotal;
    dia.pedidos += 1;
  }
  return salida;
}

export interface Reparto<K extends string> {
  clave: K;
  cantidad: number;
  monto: number;
  parte: number;
}

function repartir<K extends string>(pedidos: Pedido[], periodo: Periodo, clave: (p: Pedido) => K): Reparto<K>[] {
  const validos = pedidos.filter((p) => p.estado !== 'CANCELADO' && enPeriodo(fechaDePedido(p), periodo));
  const mapa = new Map<K, Reparto<K>>();
  for (const p of validos) {
    const k = clave(p);
    const fila = mapa.get(k) ?? { clave: k, cantidad: 0, monto: 0, parte: 0 };
    fila.cantidad += 1;
    fila.monto += p.precioTotal;
    mapa.set(k, fila);
  }
  return [...mapa.values()].map((f) => ({ ...f, parte: validos.length ? f.cantidad / validos.length : 0 })).sort((a, b) => b.cantidad - a.cantidad);
}

export const porModalidad = (pedidos: Pedido[], periodo: Periodo) => repartir<Modalidad>(pedidos, periodo, (p) => p.modalidad);
export const porMedioDePago = (pedidos: Pedido[], periodo: Periodo) => repartir<MetodoPago>(pedidos, periodo, (p) => p.metodoPago);

export interface PlatoOpinado {
  platoId: number;
  nombre: string;
  promedio: number;
  opiniones: number;
}

/** Promedio de opiniones de cada plato que fue elegido en la encuesta, del peor al mejor. */
export function platosPorOpinion(calificaciones: Calificacion[], platos: Plato[], periodo: Periodo): PlatoOpinado[] {
  const mapa = new Map<number, { suma: number; n: number }>();
  for (const c of calificaciones) {
    if (c.platoId === null || !enPeriodo(c.fecha, periodo)) continue;
    const fila = mapa.get(c.platoId) ?? { suma: 0, n: 0 };
    fila.suma += c.comida ?? c.puntaje;
    fila.n += 1;
    mapa.set(c.platoId, fila);
  }
  return [...mapa.entries()]
    .map(([platoId, { suma, n }]) => ({ platoId, nombre: platos.find((p) => p.id === platoId)?.nombre ?? `Plato #${platoId}`, promedio: suma / n, opiniones: n }))
    .sort((a, b) => a.promedio - b.promedio || b.opiniones - a.opiniones);
}

export interface Aspectos {
  general: number | null;
  atencion: number | null;
  comida: number | null;
  espacio: number | null;
  total: number;
}

/** Promedios de la encuesta: el puntaje general y los aspectos que el cliente quiso puntuar. */
export function promediosEncuesta(calificaciones: Calificacion[], periodo: Periodo): Aspectos {
  const delPeriodo = calificaciones.filter((c) => enPeriodo(c.fecha, periodo));
  const promedio = (valores: (number | null)[]) => {
    const v = valores.filter((x): x is number => x !== null);
    return v.length ? v.reduce((n, x) => n + x, 0) / v.length : null;
  };
  return {
    general: promedio(delPeriodo.map((c) => c.puntaje)),
    atencion: promedio(delPeriodo.map((c) => c.atencion)),
    comida: promedio(delPeriodo.map((c) => c.comida)),
    espacio: promedio(delPeriodo.map((c) => c.espacio)),
    total: delPeriodo.length
  };
}

export interface ClienteFrecuente {
  usuarioId: number;
  nombre: string;
  email: string;
  pedidos: number;
  reservas: number;
  gasto: number;
}

/** Quiénes más vuelven: pedidos (no cancelados) y reservas (no canceladas) del período. */
export function clientesFrecuentes(pedidos: Pedido[], reservas: Reserva[], usuarios: Usuario[], periodo: Periodo): ClienteFrecuente[] {
  const mapa = new Map<number, ClienteFrecuente>();
  const fila = (id: number) => {
    let f = mapa.get(id);
    if (!f) {
      f = { usuarioId: id, nombre: '', email: usuarios.find((u) => u.id === id)?.email ?? `Cliente #${id}`, pedidos: 0, reservas: 0, gasto: 0 };
      mapa.set(id, f);
    }
    return f;
  };
  for (const p of pedidos) {
    if (p.estado === 'CANCELADO' || !enPeriodo(fechaDePedido(p), periodo)) continue;
    const f = fila(p.clienteId);
    f.pedidos += 1;
    f.gasto += p.precioTotal;
  }
  for (const r of reservas) {
    if (r.estado === 'CANCELADA' || !enPeriodo(r.fecha, periodo)) continue;
    const f = fila(r.clienteId);
    f.reservas += 1;
    if (r.nombre && !f.nombre) f.nombre = r.nombre;
  }
  return [...mapa.values()].sort((a, b) => b.pedidos + b.reservas - (a.pedidos + a.reservas) || b.gasto - a.gasto);
}

/** Variación contra el período anterior, en proporción (0,12 = +12 %). null si no hay base. */
export function variacion(actual: number, anterior: number): number | null {
  if (!anterior) return null;
  return (actual - anterior) / anterior;
}
