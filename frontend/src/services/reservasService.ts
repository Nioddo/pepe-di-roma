import { api } from './api';
import type { EstadoReserva, Reserva, ReservaInput } from '../types';

const RUTA = '/reservas';

export function getReservas(): Promise<Reserva[]> {
  return api.get<Reserva[]>(RUTA);
}

export function getReserva(id: number): Promise<Reserva> {
  return api.get<Reserva>(`${RUTA}/${id}`);
}

export async function getReservasDeCliente(clienteId: number): Promise<Reserva[]> {
  const reservas = await getReservas();
  return reservas.filter((r) => r.clienteId === clienteId);
}

export function createReserva(datos: ReservaInput): Promise<Reserva> {
  return api.post<Reserva>(RUTA, datos);
}

export function updateReserva(id: number, cambios: Partial<ReservaInput>): Promise<Reserva> {
  return api.put<Reserva>(`${RUTA}/${id}`, cambios);
}

export function cambiarEstadoReserva(id: number, estado: EstadoReserva): Promise<Reserva> {
  return api.put<Reserva>(`${RUTA}/${id}`, { estado });
}

export function deleteReserva(id: number): Promise<Reserva> {
  return api.delete<Reserva>(`${RUTA}/${id}`);
}
