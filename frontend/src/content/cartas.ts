// Datos institucionales de las tres cartas impresas del local (diseño/cartas).
// Los platos, precios y secciones NO están acá: vienen de la API.

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

export const CARTAS: CartaInfo[] = [
  {
    id: 'RISTORANTE',
    nombre: 'Il Ristorante',
    titulo: null,
    subtitulo: null,
    uso: 'Almuerzo y cena en el salón.',
    pie: ['Amore eterno per la pasta', 'No cobramos cubierto · Descuento por pago en efectivo: 10%']
  },
  {
    id: 'PER_PORTARE_VIA',
    nombre: 'Per portare via',
    titulo: 'Per portare via',
    subtitulo: 'Venta por mostrador',
    uso: 'Pasta fresca, salsas y dulces para llevar.',
    pie: []
  },
  {
    id: 'COLAZIONE',
    nombre: 'Colazione e merenda',
    titulo: 'La colazione e la merenda',
    subtitulo: null,
    uso: 'Desayunos y meriendas, dulces y salados.',
    pie: ['Amore eterno per la pasta', 'Descuento por pago en efectivo: 10%']
  }
];

export function cartaInfo(id: CartaId): CartaInfo {
  return CARTAS.find((c) => c.id === id) ?? CARTAS[0];
}

/** "Tempo di cottura": va en la carta para llevar, después de las pastas simples. */
export const COTTURA = {
  carta: 'PER_PORTARE_VIA' as CartaId,
  despuesDe: 'Paste Semplice',
  formas: [
    { nombre: 'Anolini', tiempo: '4′ a 5′', img: anolini },
    { nombre: 'Radiatori', tiempo: '2′ a 3′', img: radiatori },
    { nombre: 'Cappelacci', tiempo: '4′ a 5′', img: cappelacci },
    { nombre: 'Maccheroni', tiempo: '3′ a 4′', img: maccheroni },
    { nombre: 'Agnolotti', tiempo: '4′ a 5′', img: agnolotti },
    { nombre: 'Tortelli', tiempo: '4′ a 5′', img: tortelli },
    { nombre: 'Mafaldine', tiempo: '3′ a 4′', img: mafaldine },
    { nombre: 'Casoncelli', tiempo: '4′ a 5′', img: casoncelli },
    { nombre: 'Spaghetti', tiempo: '2′ a 3′', img: spaghetti },
    { nombre: 'Mezze maniche', tiempo: '3′ a 4′', img: mezzeManiche },
    { nombre: 'Caramelle', tiempo: '4′ a 5′', img: caramelle },
    { nombre: 'Gnocchi', tiempo: '2′', img: gnocchi },
    { nombre: 'Tortelloni', tiempo: '4′ a 5′', img: tortelloni },
    { nombre: 'Cappelletti', tiempo: '4′ a 5′', img: cappelletti },
    { nombre: 'Fusilli', tiempo: '2′ a 3′', img: fusilli }
  ],
  consejos: [
    {
      titulo: 'Istruzioni',
      texto: ['Una vez que el agua rompa hervor, añadir sal y cocinar de acuerdo al tipo de pasta.']
    },
    {
      titulo: 'Come ti piace',
      texto: ['En todos los casos, el tiempo de cocción puede variar según el gusto de cada comensal.']
    },
    {
      titulo: 'Ottima conservazione',
      texto: ['Heladera: pasta rellena dentro de los 2 días, pasta extruida dentro de los 4 días.']
    },
    {
      titulo: 'In freezer',
      texto: ['Hasta 3 meses. Cocinar sin descongelar.']
    },
    {
      titulo: 'Porzione',
      texto: ['Pasta rellena 200 gr.', 'Pasta extruida 180 gr.']
    }
  ]
};
