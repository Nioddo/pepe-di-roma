import { api } from './api';
import type { Mesa } from '../types';

const RUTA = '/mesas';

export function getMesas(): Promise<Mesa[]> {
  return api.get<Mesa[]>(RUTA);
}
