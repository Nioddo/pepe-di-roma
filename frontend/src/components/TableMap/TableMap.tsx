import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { usePlano } from '../../hooks/useSalon';
import { acotar, tamanoMesa, type Caja, type Elemento, type Plano } from '../../utils/plano';
import type { Mesa } from '../../types';
import './TableMap.css';

export type EstadoMesa = 'libre' | 'ocupada' | 'elegida' | 'bloqueada';

const DESCRIPCION: Record<EstadoMesa, string> = {
  libre: 'disponible',
  ocupada: 'ocupada en ese horario',
  elegida: 'elegida',
  bloqueada: 'no disponible para este grupo'
};

const porciento = (parte: number, total: number) => `${(parte / total) * 100}%`;

/** Dónde va una caja del plano, en porcentajes: así el dibujo escala entero con el ancho. */
export const cajaEn = (caja: Caja, plano: Pick<Plano, 'ancho' | 'alto'>): CSSProperties => ({
  left: porciento(caja.x, plano.ancho),
  top: porciento(caja.y, plano.alto),
  width: porciento(caja.w, plano.ancho),
  height: porciento(caja.h, plano.alto)
});

/** La caja de una mesa: su lugar guardado y el tamaño que le da la capacidad, siempre adentro del plano. */
export const cajaDeMesa = (mesa: Mesa, plano: Pick<Plano, 'ancho' | 'alto'>): Caja =>
  acotar({ x: mesa.posicionX, y: mesa.posicionY, ...tamanoMesa(mesa.capacidad) }, plano);

interface PlanoSalonProps extends HTMLAttributes<HTMLDivElement> {
  plano: Pick<Plano, 'ancho' | 'alto'>;
  lienzoRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * El local visto desde arriba: las paredes y, adentro, todo ubicado libremente.
 * Lo usan el mapa de reservas y el editor del salón, así los dos muestran el mismo plano.
 */
export function PlanoSalon({ plano, lienzoRef, children, className = '', style, ...resto }: PlanoSalonProps) {
  return (
    <div className={`plano-salon ${className}`} style={style} {...resto}>
      <div
        ref={lienzoRef}
        className="plano-salon__lienzo"
        style={{ aspectRatio: `${plano.ancho} / ${plano.alto}`, '--ancho': plano.ancho } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

/** El dibujo de un elemento fijo del salón (cocina, baño, cartel, columna…). */
export function ElementoForma({ elemento }: { elemento: Elemento }) {
  const parado = elemento.h > elemento.w * 1.4;
  return (
    <span className={`elem elem--${elemento.tipo}`} data-parado={parado || undefined}>
      {elemento.texto && <span className="elem__texto">{elemento.texto}</span>}
    </span>
  );
}

/** La mesa vista desde arriba: la tapa con el número y una silla por persona, repartidas en los dos lados. */
export function MesaForma({ numero, capacidad, texto }: { numero: number; capacidad: number; texto: string }) {
  const arriba = Math.min(4, Math.ceil(capacidad / 2));
  const abajo = Math.min(4, Math.floor(capacidad / 2));
  const sillas = (n: number) => (
    <span className="mesa__sillas" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
  return (
    <>
      {sillas(arriba)}
      <span className="mesa__tapa">
        <span className="table-btn__n">{numero}</span>
        <span className="table-btn__cap">{texto}</span>
      </span>
      {sillas(abajo)}
    </>
  );
}

interface TableMapProps {
  mesas: Mesa[];
  estadoDe: (mesa: Mesa) => EstadoMesa;
  onElegir: (mesa: Mesa) => void;
}

/**
 * Plano del salón para reservar. Cada mesa va donde la dejó el admin (posicionX / posicionY
 * de la API). Las ocupadas o bloqueadas siguen siendo enfocables (aria-disabled)
 * para que el lector de pantalla pueda decir por qué no se eligen.
 */
export function TableMap({ mesas, estadoDe, onElegir }: TableMapProps) {
  const plano = usePlano();

  return (
    <PlanoSalon plano={plano} role="group" aria-label="Plano del salón">
      {plano.elementos.map((e) => (
        <div key={e.id} className="plano-salon__item" style={cajaEn(e, plano)} aria-hidden="true">
          <ElementoForma elemento={e} />
        </div>
      ))}
      {mesas.map((mesa, i) => {
        const estado = estadoDe(mesa);
        const inactiva = estado === 'ocupada' || estado === 'bloqueada';
        return (
          <div key={mesa.id} className="plano-salon__item plano-salon__item--mesa" style={cajaEn(cajaDeMesa(mesa, plano), plano)}>
            <button
              type="button"
              className="table-btn"
              data-estado={estado}
              style={{ '--i': i } as CSSProperties}
              aria-pressed={estado === 'elegida'}
              aria-disabled={inactiva || undefined}
              aria-label={`Mesa ${mesa.numero}, para ${mesa.capacidad} personas, ${DESCRIPCION[estado]}`}
              onClick={() => {
                if (!inactiva) onElegir(mesa);
              }}
            >
              <MesaForma numero={mesa.numero} capacidad={mesa.capacidad} texto={estado === 'ocupada' ? 'Ocupada' : `${mesa.capacidad} personas`} />
            </button>
          </div>
        );
      })}
    </PlanoSalon>
  );
}

export function TableLegend() {
  return (
    <div className="salon__legend" aria-hidden="true">
      <span><i className="swatch swatch--libre" />Disponible</span>
      <span><i className="swatch swatch--ocupada" />Ocupada</span>
      <span><i className="swatch swatch--elegida" />Elegida</span>
    </div>
  );
}
