import { loadFont as cargarAnton } from '@remotion/google-fonts/Anton';
import { loadFont as cargarPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as cargarMono } from '@remotion/google-fonts/JetBrainsMono';

export const { fontFamily: DISPLAY } = cargarAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: TEXTO } = cargarPoppins('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: MONO } = cargarMono('normal', { weights: ['400', '600'], subsets: ['latin', 'latin-ext'] });

export const FPS = 30;

// Identidad de Pepe Di Roma (frontend/src/styles/tokens.css)
export const C = {
  blanco: '#ffffff',
  rosa: '#fce8e8',
  rosaDeep: '#f7d6d6',
  rojo: '#ce1320',
  rojoOscuro: '#a80e18',
  tinta: '#1a1a1a',
  gris: '#5c5050',
  ok: '#1f7a3d',
  // Editor (VS Code Dark+)
  editor: '#1e1e1e',
  editorBarra: '#252526',
  editorTab: '#2d2d2d',
  editorBorde: '#3c3c3c',
  editorTexto: '#d4d4d4',
  editorNumero: '#6e7681'
};
