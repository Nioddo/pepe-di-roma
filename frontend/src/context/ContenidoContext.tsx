import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getContenido, updateContenido } from '../services/contenidoService';
import { mensajeDeError } from '../services/api';
import { Button } from '../components/Button/Button';
import { Loading, SkeletonBlock } from '../components/Skeleton/Skeleton';
import type { Contenido } from '../types';

interface ContenidoValor {
  items: Contenido[];
  /** Texto de una clave ('' si no existe). */
  texto: (clave: string) => string;
  /** Texto de varias líneas, separado por saltos de línea y sin líneas vacías. */
  lineas: (clave: string) => string[];
  /** Guarda varios cambios y vuelve a leer el contenido para que todo el sitio se actualice. */
  guardar: (cambios: { id: number; valor: string }[]) => Promise<void>;
}

const ContenidoContext = createContext<ContenidoValor | null>(null);

/**
 * Los textos y fotos del sitio (portada, cards, contacto, cartas) vienen de la API
 * para que el admin pueda editarlos. Hasta que llegan, se muestra la carga.
 */
export function ContenidoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Contenido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    getContenido()
      .then((datos) => {
        if (vigente) setItems(datos);
      })
      .catch((err: unknown) => {
        if (vigente) setError(mensajeDeError(err));
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const guardar = useCallback(async (cambios: { id: number; valor: string }[]) => {
    for (const c of cambios) await updateContenido(c.id, c.valor);
    setItems(await getContenido());
  }, []);

  const valor = useMemo<ContenidoValor | null>(() => {
    if (!items) return null;
    const mapa = new Map(items.map((c) => [c.clave, c.valor]));
    const texto = (clave: string) => mapa.get(clave) ?? '';
    return {
      items,
      texto,
      lineas: (clave) => texto(clave).split('\n').map((l) => l.trim()).filter(Boolean),
      guardar
    };
  }, [items, guardar]);

  if (!valor) {
    return (
      <main className="arranque">
        {error ? (
          <div className="arranque__error" role="alert">
            <p className="arranque__titulo">No pudimos abrir el sitio</p>
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setIntento((n) => n + 1);
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <Loading label="Cargando Pepe Di Roma…">
            <div className="arranque__esqueleto">
              <SkeletonBlock height={56} radius={8} />
              <SkeletonBlock height={320} radius={160} />
            </div>
          </Loading>
        )}
      </main>
    );
  }

  return <ContenidoContext.Provider value={valor}>{children}</ContenidoContext.Provider>;
}

export function useContenido(): ContenidoValor {
  const contexto = useContext(ContenidoContext);
  if (!contexto) throw new Error('useContenido debe usarse dentro de <ContenidoProvider>.');
  return contexto;
}
