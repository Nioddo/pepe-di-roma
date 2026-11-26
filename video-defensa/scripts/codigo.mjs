// Copia el código real de los archivos que se muestran en el video a src/datos/codigo.json
// Uso: node scripts/codigo.mjs
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const PROYECTO = path.resolve(RAIZ, '..');
const ARCHIVOS = [
  'backend/src/routes/reservaRoutes.js',
  'backend/src/middlewares/auth.js',
  'backend/src/controllers/ReservaController.js',
  'backend/src/services/ReservaService.js',
  'backend/src/repositories/ReservaRepository.js',
  'backend/src/enums/Messages.js',
  'backend/src/middlewares/errorHandler.js',
  'backend/src/exceptions/AppError.js',
  'frontend/src/services/api.ts',
  'frontend/src/services/reservasService.ts',
  'frontend/src/pages/Reserve/Reserve.tsx',
  'frontend/src/pages/Reserve/ReserveForm.tsx',
  'frontend/src/pages/MyReservations/MyReservations.tsx',
  'frontend/src/context/ConfirmContext.tsx'
];

const salida = {};
for (const a of ARCHIVOS) salida[a] = fs.readFileSync(path.join(PROYECTO, a), 'utf8').replace(/\r/g, '').replace(/\t/g, '  ').split('\n');
fs.writeFileSync(path.join(RAIZ, 'src', 'datos', 'codigo.json'), JSON.stringify(salida));
console.log(Object.entries(salida).map(([k, v]) => `${k}: ${v.length} líneas`).join('\n'));
