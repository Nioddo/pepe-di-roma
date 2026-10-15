// Panel para revisar el diseño: cambiar de rol y forzar los estados de carga,
// vacío y error. Solo existe en el mockup y el wireframe, no en la app.

import { useState } from 'react';
import { useToast } from '../src/context/ToastContext';
import { useConfirm } from '../src/context/ConfirmContext';
import { guardarModo, leerModo, type ModoRevision } from './apiSimulada';
import datos from './datos.json';
import './revision.css';

const ROLES = [
  { id: 'visitante', texto: 'Visitante', email: null, destino: '#/' },
  { id: 'cliente', texto: 'Cliente', email: 'cliente@pepediroma.com.ar', destino: '#/mis-reservas' },
  { id: 'admin', texto: 'Admin', email: 'admin@pepediroma.com.ar', destino: '#/admin/menu' }
];

function rolActual(): string {
  try {
    const u = JSON.parse(localStorage.getItem('pepediroma.sesion') ?? 'null');
    return u ? (u.rol === 'ADMIN' ? 'admin' : 'cliente') : 'visitante';
  } catch {
    return 'visitante';
  }
}

export function Revision({ wireframe }: { wireframe: boolean }) {
  const toast = useToast();
  const confirmar = useConfirm();
  const [abierto, setAbierto] = useState(false);
  const modo = leerModo();

  const cambiarModo = (clave: keyof ModoRevision) => {
    guardarModo({ ...modo, [clave]: !modo[clave] });
    window.location.reload();
  };

  const verComo = (rol: (typeof ROLES)[number]) => {
    const usuario = rol.email ? datos.usuarios.find((u) => u.email === rol.email) : null;
    if (usuario) localStorage.setItem('pepediroma.sesion', JSON.stringify(usuario));
    else localStorage.removeItem('pepediroma.sesion');
    window.location.hash = rol.destino;
    window.location.reload();
  };

  return (
    <div className="revision" data-abierto={abierto || undefined}>
      <button type="button" className="revision__abrir" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        {wireframe ? 'Wireframe v2' : 'Mockup v2'} · revisar estados
      </button>
      {abierto && (
        <div className="revision__panel" role="group" aria-label="Herramientas para revisar el diseño">
          <p>Ver como</p>
          <div className="revision__fila">
            {ROLES.map((r) => (
              <button key={r.id} type="button" aria-pressed={rolActual() === r.id} onClick={() => verComo(r)}>
                {r.texto}
              </button>
            ))}
          </div>
          <p>Estados de la API</p>
          <div className="revision__fila">
            <button type="button" aria-pressed={modo.lento} onClick={() => cambiarModo('lento')}>Carga lenta</button>
            <button type="button" aria-pressed={modo.vacio} onClick={() => cambiarModo('vacio')}>Listas vacías</button>
            <button type="button" aria-pressed={modo.error} onClick={() => cambiarModo('error')}>Servidor caído</button>
          </div>
          <p>Respuesta visual</p>
          <div className="revision__fila">
            <button type="button" onClick={() => toast.success('Listo: reservaste la mesa 2 para el 24/10 a las 21:00 h.')}>Toast de éxito</button>
            <button type="button" onClick={() => toast.error('La mesa ya está reservada en ese horario.')}>Toast de error</button>
            <button
              type="button"
              onClick={async () => {
                const ok = await confirmar({ titulo: '¿Eliminar el plato?', texto: '¿Seguro que querés eliminar "Tiramisù"? Deja de aparecer en la carta y no se puede pedir más.' });
                toast.success(ok ? 'Confirmaste (en la revisión no se borra nada).' : 'Cancelaste: no se eliminó nada.');
              }}
            >
              Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
