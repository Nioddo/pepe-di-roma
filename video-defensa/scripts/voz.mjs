// Genera la voz en off con IA (edge-tts, es-AR-TomasNeural) para cada escena
// y guarda la duración y los subtítulos en src/datos/voz.json.
// Uso: node scripts/voz.mjs  (requiere uv: https://docs.astral.sh/uv/)
import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const RAIZ = path.resolve(import.meta.dirname, '..');
const VOZ = path.join(RAIZ, 'public', 'voz');
const FFBIN = 'C:/Users/nicolas oddo/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.1-full_build/bin';
const FFPROBE = fs.existsSync(FFBIN) ? path.join(FFBIN, 'ffprobe.exe') : 'ffprobe';
const VOCES = 'es-AR-TomasNeural';
const escenas = JSON.parse(fs.readFileSync(path.join(RAIZ, 'src', 'datos', 'narracion.json'), 'utf8'));
fs.mkdirSync(VOZ, { recursive: true });

const aSeg = (t) => {
  const [h, m, s] = t.replace(',', '.').split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

function leerSubtitulos(archivo) {
  const crudo = fs.readFileSync(archivo, 'utf8').replace(/\r/g, '');
  return crudo
    .split('\n\n')
    .map((b) => b.trim().split('\n'))
    .map((l) => {
      const i = l.findIndex((x) => x.includes('-->'));
      if (i < 0) return null;
      const [a, b] = l[i].split('-->').map((x) => aSeg(x.trim()));
      return { desde: +a.toFixed(3), hasta: +b.toFixed(3), texto: l.slice(i + 1).join(' ').trim() };
    })
    .filter(Boolean);
}

async function generar(e) {
  const mp3 = path.join(VOZ, `${e.id}.mp3`);
  const srt = path.join(VOZ, `${e.id}.srt`);
  if (!fs.existsSync(mp3) || process.argv.includes('--forzar')) {
    await run('uvx', ['--system-certs', '--with', 'pip-system-certs', 'edge-tts', '--voice', VOCES, '--rate=+4%', '--text', e.texto, '--write-media', mp3, '--write-subtitles', srt], {
      env: { ...process.env, UV_SYSTEM_CERTS: '1' }
    });
  }
  const dur = Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString().trim());
  return { id: e.id, archivo: `voz/${e.id}.mp3`, duracion: +dur.toFixed(3), subtitulos: leerSubtitulos(srt) };
}

const resultado = [];
for (let i = 0; i < escenas.length; i += 4) {
  resultado.push(...(await Promise.all(escenas.slice(i, i + 4).map(generar))));
  console.log(`${resultado.length}/${escenas.length}`);
}
fs.writeFileSync(path.join(RAIZ, 'src', 'datos', 'voz.json'), JSON.stringify(resultado, null, 2));
const total = resultado.reduce((s, r) => s + r.duracion, 0);
console.log(resultado.map((r) => `${r.id}: ${r.duracion.toFixed(1)}s`).join('\n'));
console.log(`TOTAL ${(total / 60).toFixed(2)} min`);
