// Tipos del dominio. Reflejan exactamente los modelos y enums del backend (backend/src).

export type Rol = 'CLIENTE' | 'EMPLEADO' | 'ADMIN';

export interface Usuario {
  id: number;
  email: string;
  dni: string;
  rol: Rol;
}

export type CartaId = 'RISTORANTE' | 'PER_PORTARE_VIA' | 'COLAZIONE';

export interface Plato {
  id: number;
  nombre: string;
  precio: number;
  vegano: boolean;
  sinTacc: boolean;
  picante: boolean;
  imageUrl: string | null;
  /** Descripción que va debajo del nombre en la carta. */
  descripcion: string | null;
  /** Formato o medida que va al lado del nombre: "pocillo", "x505ml". */
  medida: string | null;
}

export interface Seccion {
  id: number;
  titulo: string;
  orden: number;
  platos: number[];
  carta: CartaId;
  /** Agrupa secciones bajo un mismo título: "I Vini", "Dolce", "Salato". */
  grupo: string | null;
  subtitulo: string | null;
  nota: string | null;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  posicionX: number;
  posicionY: number;
}

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

export interface Reserva {
  id: number;
  clienteId: number;
  fecha: string;
  horaInicio: string;
  duracionMin: number;
  cantidadIntegrantes: number;
  mesaId: number | null;
  estado: EstadoReserva;
}

export type Modalidad = 'DELIVERY' | 'TAKEAWAY' | 'SALON';
export type MetodoPago = 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA';
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface ItemPedido {
  id: number;
  pedidoId: number;
  platoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  direccion: string | null;
  items: ItemPedido[];
  estado: EstadoPedido;
  precioTotal: number;
  tiempoEstimadoMin: number;
  pagoRecibido: boolean;
}

/* ---------- Cuerpos que acepta la API ---------- */

export interface UsuarioInput {
  email: string;
  dni: string;
  rol: Rol;
}

export interface PlatoInput {
  nombre: string;
  precio: number;
  vegano: boolean;
  sinTacc: boolean;
  picante: boolean;
  imageUrl: string | null;
  descripcion: string | null;
  medida: string | null;
}

export interface SeccionInput {
  titulo: string;
  orden: number;
  platos: number[];
  carta: CartaId;
  grupo?: string | null;
  subtitulo?: string | null;
  nota?: string | null;
}

export interface ReservaInput {
  clienteId: number;
  fecha: string;
  horaInicio: string;
  cantidadIntegrantes: number;
  /** null para grupos de 5 a 12: la mesa la asigna el local. */
  mesaId: number | null;
  estado?: EstadoReserva;
}

export interface PedidoInput {
  clienteId: number;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  direccion: string | null;
  items: { platoId: number; cantidad: number }[];
}

/* ---------- Vistas que arma el frontend ---------- */

export interface SeccionConPlatos extends Seccion {
  platosDetalle: Plato[];
}
