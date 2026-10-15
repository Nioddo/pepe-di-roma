// Punto de entrada del mockup y el wireframe navegables (npm run diseno).
// Monta la misma app que src/main.tsx, con router de hash (para abrir el archivo
// con doble clic) y la API simulada en lugar del backend.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppProviders, AppRoutes } from '../src/App';
import { instalarApiSimulada } from './apiSimulada';
import { Revision } from './Revision';
import '../src/styles/index.css';
import './wireframe.css';

const esWireframe = import.meta.env.MODE === 'wireframe';

document.documentElement.classList.add('js');
if (esWireframe) document.documentElement.dataset.wireframe = '';
instalarApiSimulada();

const raiz = document.getElementById('root');
if (!raiz) throw new Error('No se encontró el elemento #root.');

createRoot(raiz).render(
  <StrictMode>
    <AppProviders>
      <HashRouter>
        <AppRoutes />
        <Revision wireframe={esWireframe} />
      </HashRouter>
    </AppProviders>
  </StrictMode>
);
