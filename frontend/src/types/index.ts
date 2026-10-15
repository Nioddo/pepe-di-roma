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
  /** Aparece en "Productos estrella" de la portada. */
  destacado: boolean;
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
  /** Quién está a cargo de la reserva y cómo contactarlo. */
  nombre: string | null;
  telefono: string | null;
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
  telefono: string | null;
  /** Indicaciones opcionales del cliente: timbre, aclaraciones del pedido… */
  indicaciones: string | null;
  /** Cuándo se hizo el pedido, en hora local: "2026-10-14T13:05". */
  creadoEn: string | null;
}

/** Opinión de un cliente: puntaje de 1 a 5, lo que comió y un mensaje para el local. */
export interface Calificacion {
  id: number;
  /** null cuando opinó alguien sin cuenta. */
  usuarioId: number | null;
  /** Cómo aparece firmada en la portada. */
  firma: string;
  puntaje: number;
  mensaje: string;
  fecha: string;
  platoId: number | null;
  /** El admin puede ocultarla de la portada sin borrarla. */
  visible: boolean;
  /** Respuesta del local, opcional. */
  respuesta: string | null;
  /** Los aspectos de la encuesta del local (1 a 5), todos opcionales. */
  atencion: number | null;
  comida: number | null;
  espacio: number | null;
  /** Quién atendió la mesa, si el cliente lo dice. */
  mozo: string | null;
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
  destacado: boolean;
  imageUrl: string | null;
  descripcion: string | null;
  medida: string | null;
}

export interface MesaInput {
  numero: number;
  capacidad: number;
  posicionX: number;
  posicionY: number;
}

/** Un texto o una foto del sitio, editable por el admin (portada, cards, contacto…). */
export interface Contenido {
  id: number;
  clave: string;
  valor: string;
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
  nombre: string;
  telefono: string;
}

export interface CalificacionInput {
  usuarioId: number | null;
  firma: string;
  puntaje: number;
  mensaje: string;
  platoId: number | null;
  atencion?: number | null;
  comida?: number | null;
  espacio?: number | null;
  mozo?: string | null;
}

export interface CalificacionCambios {
  firma?: string;
  puntaje?: number;
  mensaje?: string;
  platoId?: number | null;
  fecha?: string;
  visible?: boolean;
  respuesta?: string | null;
  atencion?: number | null;
  comida?: number | null;
  espacio?: number | null;
  mozo?: string | null;
}

export interface PedidoCambios {
  estado?: EstadoPedido;
  modalidad?: Modalidad;
  metodoPago?: MetodoPago;
  direccion?: string | null;
  pagoRecibido?: boolean;
  telefono?: string;
  indicaciones?: string | null;
  items?: { platoId: number; cantidad: number }[];
}

export interface PedidoInput {
  clienteId: number;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  direccion: string | null;
  telefono: string;
  indicaciones: string | null;
  items: { platoId: number; cantidad: number }[];
}

/* ---------- Vistas que arma el frontend ---------- */

export interface SeccionConPlatos extends Seccion {
  platosDetalle: Plato[];
}
