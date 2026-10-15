// Lo fijo de las tres cartas impresas: sus identificadores y las siluetas de pasta
// de "Tempo di cottura" (imágenes del proyecto). Los nombres, textos, tiempos y
// pies de cada carta se editan desde Gestión → Textos y fotos (API /contenido).

import type { CartaId } from '../types';
import anolini from '../assets/carta/pasta-anolini.png';
import radiatori from '../assets/carta/pasta-radiatori.png';
import cappelacci from '../assets/carta/pasta-cappelacci.png';
import maccheroni from '../assets/carta/pasta-maccheroni.png';
import agnolotti from '../assets/carta/pasta-agnolotti.png';
import tortelli from '../assets/carta/pasta-tortelli.png';
import mafaldine from '../assets/carta/pasta-mafaldine.png';
import casoncelli from '../assets/carta/pasta-casoncelli.png';
import spaghetti from '../assets/carta/pasta-spaghetti.png';
import caramelle from '../assets/carta/pasta-caramelle.png';
import mezzeManiche from '../assets/carta/pasta-mezze-maniche.png';
import gnocchi from '../assets/carta/pasta-gnocchi.png';
import cappelletti from '../assets/carta/pasta-cappelletti.png';
import tortelloni from '../assets/carta/pasta-tortelloni.png';
import fusilli from '../assets/carta/pasta-fusilli.png';

export const CARTA_IDS: CartaId[] = ['RISTORANTE', 'PER_PORTARE_VIA', 'COLAZIONE'];

export interface CartaInfo {
  id: CartaId;
  /** Nombre corto para las pestañas y los selectores. */
  nombre: string;
  /** Título que encabeza la hoja impresa (la del restaurante no tiene). */
  titulo: string | null;
  subtitulo: string | null;
  /** Para qué sirve esta carta, en una línea. */
  uso: string;
  pie: string[];
}

/** "Tempo di cottura" va en la carta para llevar. La clave arma 'cottura.<clave>' en el contenido. */
export const COTTURA_CARTA: CartaId = 'PER_PORTARE_VIA';

export const COTTURA_FORMAS = [
  { clave: 'anolini', nombre: 'Anolini', img: anolini },
  { clave: 'radiatori', nombre: 'Radiatori', img: radiatori },
  { clave: 'cappelacci', nombre: 'Cappelacci', img: cappelacci },
  { clave: 'maccheroni', nombre: 'Maccheroni', img: maccheroni },
  { clave: 'agnolotti', nombre: 'Agnolotti', img: agnolotti },
  { clave: 'tortelli', nombre: 'Tortelli', img: tortelli },
  { clave: 'mafaldine', nombre: 'Mafaldine', img: mafaldine },
  { clave: 'casoncelli', nombre: 'Casoncelli', img: casoncelli },
  { clave: 'spaghetti', nombre: 'Spaghetti', img: spaghetti },
  { clave: 'mezze-maniche', nombre: 'Mezze maniche', img: mezzeManiche },
  { clave: 'caramelle', nombre: 'Caramelle', img: caramelle },
  { clave: 'gnocchi', nombre: 'Gnocchi', img: gnocchi },
  { clave: 'tortelloni', nombre: 'Tortelloni', img: tortelloni },
  { clave: 'cappelletti', nombre: 'Cappelletti', img: cappelletti },
  { clave: 'fusilli', nombre: 'Fusilli', img: fusilli }
];

export const COTTURA_CONSEJOS = ['istruzioni', 'comeTiPiace', 'conservazione', 'freezer', 'porzione'];
