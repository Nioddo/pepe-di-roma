import voz from './voz.json';
import { FPS } from '../tema';

export type Subtitulo = { desde: number; hasta: number; texto: string };
export type Voz = { id: string; archivo: string; duracion: number; subtitulos: Subtitulo[] };

/** Momento de una escena: segundos fijos o el inicio de la frase que contiene la palabra clave. */
export type Momento = number | string;

export type Foco = { archivo: string; lineas: [number, number]; en: Momento };
export type Clip = { src: string; desde: number; hasta: number };
/** Zoom sobre la grabación: t en segundos del video original, x/y en píxeles de la captura 1920x1080. */
export type Zoom = { t: number; escala: number; x: number; y: number };

export type Escena =
  | { id: string; tipo: 'portada' | 'arquitectura' | 'concurrencia' | 'red' | 'cierre'; capitulo: string }
  | { id: string; tipo: 'codigo'; capitulo: string; capa: string; focos: Foco[] }
  | { id: string; tipo: 'demo'; capitulo: string; paso: string; url: string; clips: Clip[]; zooms: Zoom[] };

const B = 'backend/src/';
const F = 'frontend/src/';

export const ESCENAS: Escena[] = [
  { id: 'intro', tipo: 'portada', capitulo: 'Introducción' },
  { id: 'arquitectura', tipo: 'arquitectura', capitulo: 'Arquitectura' },
  {
    id: 'rutas', tipo: 'codigo', capitulo: 'Backend · 1 de 6', capa: 'Routes',
    focos: [
      { archivo: B + 'routes/reservaRoutes.js', lineas: [7, 11], en: 0 },
      { archivo: B + 'routes/reservaRoutes.js', lineas: [9, 9], en: 'Para crear' },
      { archivo: B + 'routes/reservaRoutes.js', lineas: [10, 11], en: 'Para leer' }
    ]
  },
  {
    id: 'auth', tipo: 'codigo', capitulo: 'Backend · 2 de 6', capa: 'Middlewares',
    focos: [
      { archivo: B + 'middlewares/auth.js', lineas: [10, 14], en: 'Identificar' },
      { archivo: B + 'middlewares/auth.js', lineas: [16, 21], en: 'RequireLogin' },
      { archivo: B + 'middlewares/auth.js', lineas: [42, 54], en: 'SoloPropio' },
      { archivo: B + 'middlewares/auth.js', lineas: [56, 63], en: 'Así' }
    ]
  },
  {
    id: 'controlador', tipo: 'codigo', capitulo: 'Backend · 3 de 6', capa: 'Controllers',
    focos: [
      { archivo: B + 'controllers/ReservaController.js', lineas: [5, 8], en: 'Cada método' },
      { archivo: B + 'controllers/ReservaController.js', lineas: [15, 18], en: 'Llama al servicio' },
      { archivo: B + 'controllers/ReservaController.js', lineas: [15, 28], en: 'El controlador no' }
    ]
  },
  {
    id: 'servicio', tipo: 'codigo', capitulo: 'Backend · 4 de 6', capa: 'Services',
    focos: [
      { archivo: B + 'services/ReservaService.js', lineas: [10, 15], en: 'constantes' },
      { archivo: B + 'services/ReservaService.js', lineas: [38, 56], en: 'La fecha' },
      { archivo: B + 'services/ReservaService.js', lineas: [58, 63], en: 'La hora' },
      { archivo: B + 'services/ReservaService.js', lineas: [65, 74], en: 'Si el grupo' },
      { archivo: B + 'services/ReservaService.js', lineas: [97, 112], en: 'Si son cuatro' },
      { archivo: B + 'services/ReservaService.js', lineas: [119, 137], en: 'La regla clave' },
      { archivo: B + 'services/ReservaService.js', lineas: [124, 126], en: 'Las canceladas' },
      { archivo: B + 'services/ReservaService.js', lineas: [131, 136], en: 'Si hay superposición' },
      { archivo: B + 'services/ReservaService.js', lineas: [139, 152], en: 'Por último' }
    ]
  },
  {
    id: 'repositorio', tipo: 'codigo', capitulo: 'Backend · 5 de 6', capa: 'Repositories',
    focos: [
      { archivo: B + 'repositories/ReservaRepository.js', lineas: [17, 52], en: 0 },
      { archivo: B + 'enums/Messages.js', lineas: [41, 51], en: 'Y todos' },
      { archivo: B + 'enums/Messages.js', lineas: [47, 47], en: 'Así' }
    ]
  },
  {
    id: 'errores', tipo: 'codigo', capitulo: 'Backend · 6 de 6', capa: 'Middlewares',
    focos: [
      { archivo: B + 'middlewares/errorHandler.js', lineas: [5, 16], en: 0 },
      { archivo: B + 'middlewares/errorHandler.js', lineas: [6, 8], en: 'Si es un AppError' },
      { archivo: B + 'middlewares/errorHandler.js', lineas: [10, 12], en: 'mal formado' },
      { archivo: B + 'middlewares/errorHandler.js', lineas: [14, 15], en: 'Cualquier otra' }
    ]
  },
  {
    id: 'api', tipo: 'codigo', capitulo: 'Frontend · 1 de 4', capa: 'Servicios HTTP',
    focos: [
      { archivo: F + 'services/api.ts', lineas: [34, 51], en: 'La función request' },
      { archivo: F + 'services/api.ts', lineas: [53, 55], en: 'Si la red' },
      { archivo: F + 'services/api.ts', lineas: [64, 67], en: 'no es exitosa' },
      { archivo: F + 'services/api.ts', lineas: [72, 79], en: 'Ninguna pantalla' }
    ]
  },
  {
    id: 'reservasService', tipo: 'codigo', capitulo: 'Frontend · 2 de 4', capa: 'Servicios HTTP',
    focos: [
      { archivo: F + 'services/reservasService.ts', lineas: [6, 33], en: 0 },
      { archivo: F + 'services/reservasService.ts', lineas: [19, 29], en: 'Las pantallas' }
    ]
  },
  {
    id: 'reservar', tipo: 'codigo', capitulo: 'Frontend · 3 de 4', capa: 'Páginas',
    focos: [
      { archivo: F + 'pages/Reserve/Reserve.tsx', lineas: [16, 24], en: 0 },
      { archivo: F + 'pages/Reserve/ReserveForm.tsx', lineas: [66, 71], en: 'ReserveForm' },
      { archivo: F + 'pages/Reserve/ReserveForm.tsx', lineas: [86, 92], en: 'Esto es' },
      { archivo: F + 'pages/Reserve/ReserveForm.tsx', lineas: [112, 119], en: 'Si el envío' },
      { archivo: F + 'pages/Reserve/ReserveForm.tsx', lineas: [120, 123], en: 'Si falla' }
    ]
  },
  {
    id: 'misReservas', tipo: 'codigo', capitulo: 'Frontend · 4 de 4', capa: 'Páginas',
    focos: [
      { archivo: F + 'pages/MyReservations/MyReservations.tsx', lineas: [34, 41], en: 0 },
      { archivo: F + 'pages/MyReservations/MyReservations.tsx', lineas: [43, 47], en: 'Si el usuario' }
    ]
  },
  {
    id: 'demoLogin', tipo: 'demo', capitulo: 'Demo', paso: 'a · Ingreso como cliente', url: 'localhost:5173/ingresar',
    clips: [{ src: 'grabaciones/reserva.mp4', desde: 1.9, hasta: 12.8 }],
    zooms: [{ t: 1.9, escala: 1.25, x: 760, y: 420 }, { t: 7, escala: 1.25, x: 760, y: 420 }, { t: 9, escala: 1, x: 960, y: 540 }]
  },
  {
    id: 'demoMapa', tipo: 'demo', capitulo: 'Demo', paso: 'b · Fecha, horario y mapa', url: 'localhost:5173/reservar',
    clips: [{ src: 'grabaciones/reserva.mp4', desde: 12.8, hasta: 23.6 }],
    zooms: [{ t: 12.8, escala: 1, x: 960, y: 540 }, { t: 15.6, escala: 1, x: 960, y: 540 }, { t: 16.8, escala: 1.65, x: 1225, y: 545 }]
  },
  {
    id: 'demoValidacion', tipo: 'demo', capitulo: 'Demo', paso: 'c · Validación en el front', url: 'localhost:5173/reservar',
    clips: [{ src: 'grabaciones/reserva.mp4', desde: 23.6, hasta: 33.1 }],
    zooms: [{ t: 23.6, escala: 1, x: 960, y: 540 }, { t: 26.8, escala: 1, x: 960, y: 540 }, { t: 28.4, escala: 1.9, x: 705, y: 600 }]
  },
  {
    id: 'demoExito', tipo: 'demo', capitulo: 'Demo', paso: 'd · Reserva confirmada (201)', url: 'localhost:5173/reservar',
    clips: [{ src: 'grabaciones/reserva.mp4', desde: 33.1, hasta: 41.4 }],
    zooms: [
      { t: 33.1, escala: 1.9, x: 705, y: 600 }, { t: 35.6, escala: 1.9, x: 705, y: 600 }, { t: 36.6, escala: 1, x: 960, y: 540 },
      { t: 38, escala: 1, x: 960, y: 540 }, { t: 39, escala: 1.6, x: 1600, y: 1000 }
    ]
  },
  { id: 'demoConcurrencia', tipo: 'concurrencia', capitulo: 'Demo · e · Concurrencia' },
  { id: 'demoRed', tipo: 'red', capitulo: 'Demo · e–f · Red' },
  {
    id: 'demoCancelar', tipo: 'demo', capitulo: 'Demo', paso: 'g · Cancelar con diálogo propio', url: 'localhost:5173/mis-reservas',
    clips: [{ src: 'grabaciones/cancelar-admin.mp4', desde: 13.2, hasta: 23.9 }],
    zooms: [{ t: 13.2, escala: 1, x: 960, y: 540 }, { t: 15, escala: 1, x: 960, y: 540 }, { t: 16.2, escala: 1.6, x: 960, y: 540 }, { t: 20, escala: 1.6, x: 960, y: 540 }, { t: 21, escala: 1.35, x: 1100, y: 620 }]
  },
  {
    id: 'demoAdmin', tipo: 'demo', capitulo: 'Demo', paso: 'h · Administrador confirma', url: 'localhost:5173/admin/reservas',
    clips: [
      { src: 'grabaciones/cancelar-admin.mp4', desde: 24, hasta: 33 },
      { src: 'grabaciones/cancelar-admin.mp4', desde: 55, hasta: 68 }
    ],
    zooms: [
      { t: 24, escala: 1, x: 960, y: 540 }, { t: 55, escala: 1, x: 960, y: 540 }, { t: 56.5, escala: 1.5, x: 900, y: 440 },
      { t: 61, escala: 1.5, x: 1000, y: 440 }, { t: 62.6, escala: 1.6, x: 1500, y: 960 }
    ]
  },
  { id: 'cierre', tipo: 'cierre', capitulo: 'Cierre' }
];

export const PAUSA = 0.7; // segundos de aire al final de cada escena

const VOZ = voz as Voz[];
export const vozDe = (id: string): Voz => {
  const v = VOZ.find((x) => x.id === id);
  if (!v) throw new Error(`Falta la voz de ${id}`);
  return v;
};

export const framesDe = (id: string) => Math.ceil((vozDe(id).duracion + PAUSA) * FPS);
export const DURACION_TOTAL = ESCENAS.reduce((s, e) => s + framesDe(e.id), 0);

/** Segundos en que empieza la frase que contiene la palabra (busca desde `desde`). */
export function momento(id: string, m: Momento, desde = 0): number {
  if (typeof m === 'number') return m;
  const subs = vozDe(id).subtitulos;
  const s = subs.find((x) => x.desde >= desde - 0.01 && x.texto.toLowerCase().includes(m.toLowerCase()));
  if (!s) throw new Error(`No encontré "${m}" en la voz de ${id}`);
  return s.desde;
}
