import { useMemo } from 'react';
import { useContenido } from '../context/ContenidoContext';
import { leerPlano } from '../utils/plano';

/** El plano del salón que armó el admin en Gestión → Salón: tamaño y todo lo que no es una mesa. */
export function usePlano() {
  const { texto } = useContenido();
  const json = texto('salon.plano');
  return useMemo(() => leerPlano(json), [json]);
}
