/**
 * El plano libre del salón. Todo se mide en unidades del plano (100 unidades ≈ 1 metro),
 * no en píxeles: el dibujo escala entero al ancho que tenga la pantalla.
 * Las mesas viven en /api/mesas (posicionX / posicionY, esquina de arriba a la izquierda);
 * el tamaño del plano y lo demás (cocina, baños, carteles…) se guardan como JSON en el contenido 'salon.plano'.
 */

export type TipoElemento =
  | 'cocina'
  | 'barra'
  | 'bano'
  | 'estanteria'
  | 'columna'
  | 'cartel'
  | 'planta'
  | 'ventana'
  | 'entrada'
  | 'pared';

export interface Elemento {
  id: string;
  tipo: TipoElemento;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Lo que dice adentro. Vacío en los que no llevan texto. */
  texto: string;
}

export interface Plano {
  ancho: number;
  alto: number;
  elementos: Elemento[];
}

export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Cada cuánto se acomoda lo que se arrastra: una grilla fina que no se nota, pero deja todo alineado. */
export const PASO = 4;

export const LIMITES = { anchoMin: 360, anchoMax: 1200, altoMin: 280, altoMax: 900, ladoMin: 12 };

interface Receta {
  nombre: string;
  w: number;
  h: number;
  texto: string;
  /** Si el admin puede escribirle un texto. */
  conTexto: boolean;
}

export const CATALOGO: Record<TipoElemento, Receta> = {
  cartel: { nombre: 'Cartel', w: 160, h: 44, texto: 'Fábrica de pastas', conTexto: true },
  columna: { nombre: 'Columna', w: 24, h: 24, texto: '', conTexto: false },
  bano: { nombre: 'Baño', w: 150, h: 100, texto: 'Baño', conTexto: true },
  cocina: { nombre: 'Cocina', w: 360, h: 60, texto: 'Cocina a la vista', conTexto: true },
  barra: { nombre: 'Barra', w: 220, h: 48, texto: 'Barra', conTexto: true },
  estanteria: { nombre: 'Estantería', w: 32, h: 240, texto: 'Estantería', conTexto: true },
  planta: { nombre: 'Planta', w: 44, h: 44, texto: '', conTexto: false },
  ventana: { nombre: 'Ventana', w: 12, h: 120, texto: '', conTexto: false },
  entrada: { nombre: 'Entrada', w: 120, h: 36, texto: 'Entrada', conTexto: true },
  pared: { nombre: 'Pared', w: 200, h: 8, texto: '', conTexto: false }
};

export const TIPOS = Object.keys(CATALOGO) as TipoElemento[];

/** El plano con el que arranca el local: cocina arriba, baño en la esquina, estantería a la izquierda. */
export const PLANO_INICIAL: Plano = {
  ancho: 880,
  alto: 600,
  elementos: [
    { id: 'cocina', tipo: 'cocina', x: 52, y: 20, w: 600, h: 60, texto: 'Cocina a la vista' },
    { id: 'bano', tipo: 'bano', x: 716, y: 0, w: 164, h: 104, texto: 'Baño' },
    { id: 'estanteria', tipo: 'estanteria', x: 0, y: 128, w: 32, h: 420, texto: 'Estantería' },
    { id: 'columna', tipo: 'columna', x: 456, y: 300, w: 24, h: 24, texto: '' },
    { id: 'ventana', tipo: 'ventana', x: 868, y: 248, w: 12, h: 132, texto: '' },
    { id: 'entrada', tipo: 'entrada', x: 500, y: 560, w: 120, h: 36, texto: 'Entrada' }
  ]
};

export const ajustar = (n: number) => Math.round(n / PASO) * PASO;

const entre = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

/** Cuánto ocupa una mesa: la tapa crece con las sillas de cada lado. */
export function tamanoMesa(capacidad: number): { w: number; h: number } {
  const porLado = Math.min(4, Math.max(1, Math.ceil(capacidad / 2)));
  return { w: 56 + porLado * 24, h: 96 };
}

/** Deja una caja adentro del plano, sin cambiarle el tamaño si entra. */
export function acotar(caja: Caja, plano: Pick<Plano, 'ancho' | 'alto'>): Caja {
  const w = entre(caja.w, LIMITES.ladoMin, plano.ancho);
  const h = entre(caja.h, LIMITES.ladoMin, plano.alto);
  return { w, h, x: entre(caja.x, 0, plano.ancho - w), y: entre(caja.y, 0, plano.alto - h) };
}

const esNumero = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Lee el JSON guardado. Si falta o está roto, devuelve el plano inicial: el mapa de reservas nunca queda vacío. */
export function leerPlano(json: string): Plano {
  try {
    const crudo = JSON.parse(json) as Partial<Plano> | null;
    if (!crudo || !esNumero(crudo.ancho) || !esNumero(crudo.alto) || !Array.isArray(crudo.elementos)) return PLANO_INICIAL;
    const plano = {
      ancho: entre(crudo.ancho, LIMITES.anchoMin, LIMITES.anchoMax),
      alto: entre(crudo.alto, LIMITES.altoMin, LIMITES.altoMax)
    };
    const elementos = crudo.elementos
      .filter((e): e is Elemento => !!e && typeof e.id === 'string' && e.tipo in CATALOGO && [e.x, e.y, e.w, e.h].every(esNumero))
      .map((e) => ({ id: e.id, tipo: e.tipo, texto: typeof e.texto === 'string' ? e.texto : '', ...acotar(e, plano) }));
    return { ...plano, elementos };
  } catch {
    return PLANO_INICIAL;
  }
}

/** Hasta dónde llega lo que hay en el plano: el salón no se puede achicar por debajo de esto. */
export function ocupado(cajas: Caja[]): { ancho: number; alto: number } {
  return {
    ancho: Math.max(LIMITES.anchoMin, ...cajas.map((c) => c.x + c.w)),
    alto: Math.max(LIMITES.altoMin, ...cajas.map((c) => c.y + c.h))
  };
}
