// API simulada para el mockup y el wireframe navegables (diseño/v2).
// Intercepta fetch('/api/...') y responde igual que el backend de la Entrega 2,
// con sus mismas reglas, sobre una copia en memoria de sus datos semilla.
// No forma parte de la app: la app real habla con el backend de verdad.

import datos from './datos.json';

type Registro = { id: number; [campo: string]: unknown };
type Tabla = Registro[];

export interface ModoRevision {
  lento: boolean;
  vacio: boolean;
  error: boolean;
  /** Opiniones de ejemplo para revisar la portada con calificaciones (rotuladas como ejemplo). */
  muestras: boolean;
}

const CLAVE_MODO = 'pepediroma.mockup.modo';

export function leerModo(): ModoRevision {
  try {
    return { lento: false, vacio: false, error: false, muestras: false, ...JSON.parse(sessionStorage.getItem(CLAVE_MODO) ?? '{}') };
  } catch {
    return { lento: false, vacio: false, error: false, muestras: false };
  }
}

export function guardarModo(modo: ModoRevision): void {
  try {
    sessionStorage.setItem(CLAVE_MODO, JSON.stringify(modo));
  } catch {
    // sin almacenamiento: el modo dura hasta recargar
  }
}

const db: Record<string, Tabla> = JSON.parse(JSON.stringify(datos));

// Solo para revisar el diseño: el texto dice que son ejemplos, no opiniones reales.
const platoPorNombre = (nombre: string) => db.platos.find((p) => p.nombre === nombre)?.id ?? null;
const MUESTRAS: Registro[] = [
  { id: 9001, usuarioId: 1, firma: 'Cliente de ejemplo', puntaje: 5, atencion: 5, comida: 5, espacio: 4, mozo: null, fecha: '2026-10-10', visible: true, respuesta: 'Respuesta de ejemplo del local.', platoId: platoPorNombre("Gnocchi fritti all'arrabbiata"), mensaje: 'Opinión de ejemplo para revisar el diseño: así se lee la cita principal, a tamaño de frase.' },
  { id: 9002, usuarioId: 2, firma: 'Otro cliente de ejemplo', puntaje: 4, atencion: null, comida: null, espacio: null, mozo: null, fecha: '2026-10-06', visible: true, respuesta: null, platoId: platoPorNombre('Lasagna al ragù'), mensaje: 'Segunda opinión de ejemplo, más corta.' },
  { id: 9003, usuarioId: null, firma: 'Cliente de ejemplo', puntaje: 4, atencion: null, comida: null, espacio: null, mozo: null, fecha: '2026-10-01', visible: true, respuesta: null, platoId: null, mensaje: 'Tercera opinión de ejemplo, sin plato elegido.' }
];
const DURACION_MIN = 120;
const LATENCIA_MS = 450;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}
const ok = (data: unknown, status = 200) => respuesta(status, { success: true, data });
const fallo = (message: string, status = 400) => respuesta(status, { success: false, message });

const siguienteId = (tabla: Tabla) => Math.max(0, ...tabla.map((r) => r.id)) + 1;
const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

function conItems(pedido: Registro): Registro {
  return { ...pedido, items: db['items-pedido'].filter((i) => i.pedidoId === pedido.id) };
}

function mesaOcupada(mesaId: number, fecha: string, hora: string, excluir?: number): boolean {
  const inicio = aMinutos(hora);
  return db.reservas.some((r) => {
    if (r.id === excluir || r.estado === 'CANCELADA' || r.mesaId !== mesaId || r.fecha !== fecha) return false;
    const otro = aMinutos(String(r.horaInicio));
    return inicio < otro + DURACION_MIN && otro < inicio + DURACION_MIN;
  });
}

/** Misma regla que backend/src/services/ReservaService.js */
const telefonoValido = (t: unknown) => typeof t === 'string' && /^\d{8,15}$/.test(t.replace(/[\s()+-]/g, ''));
const ahora = () => {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

function validarReserva(r: Registro, excluir?: number): Response | null {
  if (typeof r.nombre !== 'string' || !r.nombre.trim()) return fallo('El nombre de quien reserva es obligatorio (hasta 60 caracteres)');
  if (!telefonoValido(r.telefono)) return fallo('El telefono debe tener entre 8 y 15 numeros');
  const n = Number(r.cantidadIntegrantes);
  if (n > 12) return fallo('Las reservas de mas de 12 personas no se pueden hacer online');
  const mesaId = r.mesaId === null || r.mesaId === undefined ? null : Number(r.mesaId);
  if (n <= 4) {
    if (mesaId === null) return fallo('Las reservas de hasta 4 personas deben elegir una mesa');
    const mesa = db.mesas.find((m) => m.id === mesaId);
    if (!mesa) return fallo('La mesa indicada no existe', 404);
    if (Number(mesa.capacidad) < n) return fallo('La mesa no tiene capacidad para esa cantidad de integrantes', 409);
  }
  if (mesaId !== null && r.estado !== 'CANCELADA' && mesaOcupada(mesaId, String(r.fecha), String(r.horaInicio), excluir)) {
    return fallo('La mesa ya esta reservada en ese horario', 409);
  }
  return null;
}

function armarPedido(body: Registro, id: number): { pedido: Registro; items: Registro[] } | Response {
  const cliente = db.usuarios.find((u) => u.id === Number(body.clienteId));
  if (cliente && cliente.rol !== 'CLIENTE') return fallo('El personal del local no puede hacer pedidos desde la web', 403);
  if (!telefonoValido(body.telefono)) return fallo('El telefono debe tener entre 8 y 15 numeros');
  const lineas = (body.items as { platoId: number; cantidad: number }[] | undefined) ?? [];
  if (!lineas.length) return fallo('El pedido debe tener al menos un item');
  if (body.modalidad === 'DELIVERY' && !String(body.direccion ?? '').trim()) {
    return fallo('La direccion es obligatoria para los pedidos con delivery');
  }
  let siguienteItem = siguienteId(db['items-pedido']);
  const items: Registro[] = [];
  for (const l of lineas) {
    const plato = db.platos.find((p) => p.id === l.platoId);
    if (!plato) return fallo('El plato solicitado no existe', 404);
    items.push({ id: siguienteItem++, pedidoId: id, platoId: plato.id, nombre: plato.nombre, precioUnitario: plato.precio, cantidad: l.cantidad });
  }
  const unidades = items.reduce((n, i) => n + Number(i.cantidad), 0);
  const pedido: Registro = {
    id,
    clienteId: body.clienteId,
    modalidad: body.modalidad,
    metodoPago: body.metodoPago,
    direccion: body.modalidad === 'DELIVERY' ? body.direccion : null,
    estado: 'PENDIENTE',
    precioTotal: items.reduce((s, i) => s + Number(i.precioUnitario) * Number(i.cantidad), 0),
    tiempoEstimadoMin: 15 + unidades * 5 + (body.modalidad === 'DELIVERY' ? 20 : 0),
    pagoRecibido: false,
    telefono: body.telefono,
    indicaciones: typeof body.indicaciones === 'string' && body.indicaciones.trim() ? body.indicaciones.trim() : null,
    creadoEn: body.creadoEn ?? ahora()
  };
  return { pedido, items };
}

const DEFECTOS: Record<string, Record<string, unknown>> = {
  platos: { vegano: false, sinTacc: false, picante: false, destacado: false, imageUrl: null, descripcion: null, medida: null },
  calificaciones: { usuarioId: null, platoId: null, visible: true, respuesta: null, atencion: null, comida: null, espacio: null, mozo: null },
  secciones: { carta: 'RISTORANTE', grupo: null, subtitulo: null, nota: null, platos: [] },
  reservas: { estado: 'PENDIENTE', duracionMin: DURACION_MIN, mesaId: null }
};

function manejar(metodo: string, recurso: string, id: number | null, body: Registro, modo: ModoRevision): Response {
  const tabla = db[recurso];
  if (!tabla) return fallo('La ruta solicitada no existe', 404);

  if (metodo === 'GET') {
    if (id === null) {
      // sin textos el sitio no arranca: el modo "vacío" no los borra
      const vaciable = !['usuarios', 'mesas', 'contenido'].includes(recurso);
      const conMuestras = recurso === 'calificaciones' && modo.muestras ? [...tabla, ...MUESTRAS] : tabla;
      const lista = modo.vacio && vaciable ? [] : conMuestras;
      return ok(recurso === 'pedidos' ? lista.map(conItems) : lista);
    }
    const r = tabla.find((x) => x.id === id);
    if (!r) return fallo('El recurso solicitado no existe', 404);
    return ok(recurso === 'pedidos' ? conItems(r) : r);
  }

  if (metodo === 'POST') {
    const nuevoId = siguienteId(tabla);
    if (recurso === 'usuarios') {
      if (db.usuarios.some((u) => String(u.email).toLowerCase() === String(body.email).toLowerCase())) {
        return fallo('Ya existe un usuario con ese email', 409);
      }
      if (db.usuarios.some((u) => u.dni === body.dni)) return fallo('Ya existe un usuario con ese DNI', 409);
    }
    if (recurso === 'secciones' && db.secciones.some((s) => s.carta === (body.carta ?? 'RISTORANTE') && String(s.titulo).toLowerCase() === String(body.titulo).toLowerCase())) {
      return fallo('Ya existe una seccion con ese titulo en esa carta', 409);
    }
    if (recurso === 'calificaciones') {
      const puntaje = Number(body.puntaje);
      if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) return fallo('El puntaje debe ser un entero entre 1 y 5');
      if (!String(body.mensaje ?? '').trim()) return fallo('El mensaje de la calificacion es obligatorio');
      body.fecha = body.fecha ?? new Date().toISOString().slice(0, 10);
    }
    if (recurso === 'mesas' && db.mesas.some((m) => m.numero === body.numero)) return fallo('Ya existe una mesa con ese numero', 409);
    if (recurso === 'pedidos') {
      const armado = armarPedido(body, nuevoId);
      if (armado instanceof Response) return armado;
      tabla.push(armado.pedido);
      db['items-pedido'].push(...armado.items);
      return ok(conItems(armado.pedido), 201);
    }
    const nuevo: Registro = { ...DEFECTOS[recurso], ...body, id: nuevoId };
    if (recurso === 'reservas') {
      const error = validarReserva(nuevo);
      if (error) return error;
    }
    tabla.push(nuevo);
    return ok(nuevo, 201);
  }

  const registro = id === null ? undefined : tabla.find((x) => x.id === id);
  if (!registro) return fallo('El recurso solicitado no existe', 404);

  if (metodo === 'PUT') {
    const resultado = { ...registro, ...body };
    if (recurso === 'reservas') {
      const error = validarReserva(resultado, registro.id);
      if (error) return error;
    }
    if (recurso === 'mesas' && body.numero !== undefined && db.mesas.some((m) => m.id !== registro.id && m.numero === body.numero)) {
      return fallo('Ya existe una mesa con ese numero', 409);
    }
    if (recurso === 'pedidos' && (body.items !== undefined || body.modalidad !== undefined)) {
      // como el backend: los ítems se reemplazan y el total y el tiempo se recalculan
      const actuales = db['items-pedido'].filter((i) => i.pedidoId === registro.id).map((i) => ({ platoId: i.platoId, cantidad: i.cantidad }));
      const armado = armarPedido({ ...registro, ...body, items: body.items ?? actuales }, registro.id);
      if (armado instanceof Response) return armado;
      db['items-pedido'] = db['items-pedido'].filter((i) => i.pedidoId !== registro.id).concat(armado.items);
      const { precioTotal, tiempoEstimadoMin, direccion } = armado.pedido;
      const { items: _items, ...resto } = body;
      Object.assign(registro, resto, { precioTotal, tiempoEstimadoMin, direccion });
      return ok(conItems(registro));
    }
    Object.assign(registro, body);
    return ok(recurso === 'pedidos' ? conItems(registro) : registro);
  }

  if (metodo === 'DELETE') {
    if (recurso === 'platos' && db.secciones.some((s) => (s.platos as number[]).includes(registro.id))) {
      return fallo('No se puede eliminar un plato que pertenece a una seccion', 409);
    }
    if (recurso === 'usuarios') {
      const conDatos = ['reservas', 'pedidos'].some((t) => db[t].some((r) => r.clienteId === registro.id)) || db.calificaciones.some((c) => c.usuarioId === registro.id);
      if (conDatos) return fallo('No se puede eliminar un usuario con reservas, pedidos o calificaciones asociadas', 409);
    }
    if (recurso === 'mesas' && db.reservas.some((r) => r.mesaId === registro.id && (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'))) {
      return fallo('No se puede eliminar una mesa con reservas activas', 409);
    }
    if (recurso === 'pedidos') db['items-pedido'] = db['items-pedido'].filter((i) => i.pedidoId !== registro.id);
    tabla.splice(tabla.indexOf(registro), 1);
    return ok(registro);
  }

  return fallo('Metodo no soportado', 405);
}

export function instalarApiSimulada(): void {
  const original = window.fetch.bind(window);

  window.fetch = async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    const ruta = url.match(/\/api\/([a-z-]+)(?:\/(\d+))?/);
    if (!ruta) return original(entrada, init);

    const modo = leerModo();
    await esperar(modo.lento ? 2600 : LATENCIA_MS);
    if (modo.error) return fallo('No pudimos conectar con el servidor (error simulado desde el panel de revisión).', 503);

    const metodo = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? (JSON.parse(String(init.body)) as Registro) : ({} as Registro);
    return manejar(metodo, ruta[1], ruta[2] ? Number(ruta[2]) : null, body, modo);
  };
}
