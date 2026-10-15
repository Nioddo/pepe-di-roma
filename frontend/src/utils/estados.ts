import type { EstadoPedido, EstadoReserva, MetodoPago, Modalidad } from '../types';
import type { BadgeTono } from '../components/Badge/Badge';

export const ESTADO_RESERVA: Record<EstadoReserva, { texto: string; tono: BadgeTono }> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'warn' },
  CONFIRMADA: { texto: 'Confirmada', tono: 'ok' },
  CANCELADA: { texto: 'Cancelada', tono: 'danger' },
  FINALIZADA: { texto: 'Finalizada', tono: 'off' }
};

export const ESTADO_PEDIDO: Record<EstadoPedido, { texto: string; tono: BadgeTono }> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'warn' },
  EN_PREPARACION: { texto: 'En preparación', tono: 'info' },
  EN_CAMINO: { texto: 'En camino', tono: 'ok' },
  ENTREGADO: { texto: 'Entregado', tono: 'off' },
  CANCELADO: { texto: 'Cancelado', tono: 'danger' }
};

/** Para retiro en el local, "en camino" se muestra como "listo para retirar". */
export function textoEstadoPedido(estado: EstadoPedido, modalidad: Modalidad): string {
  if (estado === 'EN_CAMINO' && modalidad !== 'DELIVERY') return 'Listo para retirar';
  return ESTADO_PEDIDO[estado].texto;
}

export const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'EN_CAMINO',
  EN_CAMINO: 'ENTREGADO'
};

export function textoAvance(estado: EstadoPedido, modalidad: Modalidad): string {
  if (estado === 'PENDIENTE') return 'Confirmar';
  if (estado === 'EN_PREPARACION') return modalidad === 'DELIVERY' ? 'Enviar' : 'Listo para retirar';
  if (estado === 'EN_CAMINO') return 'Marcar entregado';
  return '';
}

export const MODALIDAD: Record<Modalidad, string> = {
  DELIVERY: 'Envío a domicilio',
  TAKEAWAY: 'Retiro en local',
  SALON: 'En el salón'
};

export const METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  TRANSFERENCIA: 'Transferencia'
};
