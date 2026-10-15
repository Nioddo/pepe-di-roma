import { api } from './api';
import type { EstadoPedido, Pedido, PedidoCambios, PedidoInput } from '../types';

const RUTA = '/pedidos';

export function getPedidos(): Promise<Pedido[]> {
  return api.get<Pedido[]>(RUTA);
}

export async function getPedidosDeCliente(clienteId: number): Promise<Pedido[]> {
  const pedidos = await getPedidos();
  return pedidos.filter((p) => p.clienteId === clienteId);
}

export function createPedido(datos: PedidoInput): Promise<Pedido> {
  return api.post<Pedido>(RUTA, datos);
}

export function updatePedido(id: number, cambios: PedidoCambios): Promise<Pedido> {
  return api.put<Pedido>(`${RUTA}/${id}`, cambios);
}

export function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  return api.put<Pedido>(`${RUTA}/${id}`, { estado });
}

export function marcarPedidoPagado(id: number): Promise<Pedido> {
  return api.put<Pedido>(`${RUTA}/${id}`, { pagoRecibido: true });
}

export function deletePedido(id: number): Promise<Pedido> {
  return api.delete<Pedido>(`${RUTA}/${id}`);
}
