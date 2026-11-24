import { api } from './api';
import type { PromocionInput, ResultadoPromocion } from '../types';

const RUTA = '/promociones';

export function getDestinatarios(): Promise<{ total: number }> {
  return api.get<{ total: number }>(`${RUTA}/destinatarios`);
}

export function enviarPromocion(datos: PromocionInput): Promise<ResultadoPromocion> {
  return api.post<ResultadoPromocion>(RUTA, datos);
}
