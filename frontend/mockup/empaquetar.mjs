// Mete el JS y el CSS del build dentro del HTML: queda un solo archivo
// autocontenido que se abre con doble clic (los módulos externos no cargan desde file://).

import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const modo = process.argv[2];
const NOMBRES = {
  mockup: 'Mockup_v2_Pepe_Di_Roma.html',
  wireframe: 'Wireframe_v2_Pepe_Di_Roma.html'
};
if (!NOMBRES[modo]) throw new Error(`Modo desconocido: ${modo}`);

const aqui = dirname(fileURLToPath(import.meta.url));
const dist = join(aqui, `dist-${modo}`);
let html = readFileSync(join(dist, 'index.html'), 'utf8');

html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, archivo) => {
  const js = readFileSync(join(dist, archivo), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, archivo) => {
  const css = readFileSync(join(dist, archivo), 'utf8').replace(/<\/style/gi, '<\\/style');
  return `<style>${css}</style>`;
});

if (/src="\.\/assets|href="\.\/assets/.test(html)) {
  throw new Error('Quedó un recurso sin incrustar en el HTML.');
}

const destino = join(aqui, '..', '..', 'diseño', 'v2', NOMBRES[modo]);
writeFileSync(destino, html);
rmSync(dist, { recursive: true, force: true });
console.log(`${NOMBRES[modo]}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB`);
