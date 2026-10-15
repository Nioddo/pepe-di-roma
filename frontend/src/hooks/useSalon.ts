import { useContenido } from '../context/ContenidoContext';
import type { Mesa } from '../types';

/** Tamaño del plano: lo define el admin en Gestión → Salón, y crece si una mesa queda afuera. */
export function useSalon(mesas: Mesa[]) {
  const { texto } = useContenido();
  const columnas = Math.max(1, Number(texto('salon.columnas')) || 3, ...mesas.map((m) => m.posicionX + 1));
  const filas = Math.max(1, Number(texto('salon.filas')) || 2, ...mesas.map((m) => m.posicionY + 1));
  return { columnas, filas, cocina: texto('salon.cocina') };
}

export function estiloPlano(columnas: number, filas: number) {
  return {
    gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
    gridTemplateRows: `auto repeat(${filas}, auto)`
  };
}
