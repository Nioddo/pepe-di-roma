import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Con JavaScript activo, las secciones entran animadas; sin él, todo se ve igual.
document.documentElement.classList.add('js');

const raiz = document.getElementById('root');
if (!raiz) throw new Error('No se encontró el elemento #root en index.html.');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);
