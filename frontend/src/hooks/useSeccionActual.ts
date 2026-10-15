import { useEffect, useState } from 'react';

/**
 * Qué sección de la carta se está leyendo: la que cruza la franja de arriba
 * de la pantalla. Sirve para marcarla en el índice mientras se baja.
 */
export function useSeccionActual(ids: string[]): string | null {
  const [actual, setActual] = useState<string | null>(null);
  const clave = ids.join('|');

  useEffect(() => {
    const elementos = clave
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elementos.length === 0 || !('IntersectionObserver' in window)) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActual(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [clave]);

  return actual;
}
