import { useEffect, type DependencyList, type RefObject } from 'react';

/**
 * Entradas escalonadas: cada .reveal dentro del contenedor sube y aparece
 * una sola vez al entrar en pantalla, 70 ms después del anterior de su sección.
 * También toma los elementos que se agregan después (por ejemplo, cuando
 * llegan los datos de la API). `deps` vuelve a engancharlo cuando cambia el contenedor
 * (por ejemplo, al cambiar de pantalla).
 */
export function useReveal(contenedor: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;

    const mostrar = (el: Element) => el.classList.add('is-in');

    if (!('IntersectionObserver' in window)) {
      raiz.querySelectorAll('.reveal').forEach(mostrar);
      return;
    }

    const intersecciones = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            mostrar(entrada.target);
            intersecciones.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const vistos = new WeakSet<Element>();
    const porGrupo = new Map<Element, number>();

    const registrar = () => {
      raiz.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        if (vistos.has(el)) return;
        vistos.add(el);
        const grupo = el.closest('section') ?? raiz;
        const indice = porGrupo.get(grupo) ?? 0;
        porGrupo.set(grupo, indice + 1);
        el.style.transitionDelay = `${Math.min(indice * 70, 420)}ms`;
        intersecciones.observe(el);
      });
    };

    registrar();
    const cambios = new MutationObserver(registrar);
    cambios.observe(raiz, { childList: true, subtree: true });

    return () => {
      cambios.disconnect();
      intersecciones.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedor, ...deps]);
}
