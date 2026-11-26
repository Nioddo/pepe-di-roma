import { api } from './api';
import type { EnvioDifusion, EstadoDifusion } from '../types';

const RUTA = '/difusion';

export interface MailParaEnviar {
  asunto: string;
  html: string;
  texto: string;
  /** A quiénes: ids de usuario. */
  usuarioIds?: number[];
  /** Si viene, sale un solo mail de prueba a esta dirección. */
  prueba?: string;
}

/** Si la casilla está configurada, desde qué dirección sale y los últimos envíos. */
export function getDifusion(): Promise<EstadoDifusion> {
  return api.get<EstadoDifusion>(RUTA);
}

export function enviarDifusion(mail: MailParaEnviar): Promise<EnvioDifusion> {
  return api.post<EnvioDifusion>(RUTA, mail);
}
