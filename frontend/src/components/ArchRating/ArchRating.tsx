import { useId, useState, type CSSProperties } from 'react';
import { Icon } from '../Icon/Icon';
import { TEXTO_PUNTAJE } from '../../utils/puntaje';
import './ArchRating.css';

const PUNTAJES = [1, 2, 3, 4, 5];

interface ArchRatingProps {
  value: number;
  onChange: (valor: number) => void;
  label: string;
  error?: string;
  /** 'chico' para los aspectos secundarios de la encuesta. */
  tamano?: 'normal' | 'chico';
}

/**
 * Puntaje de 1 a 5 con los arcos del logotipo. Son radios nativos: se eligen
 * con el mouse, con el dedo o con las flechas del teclado.
 */
export function ArchRating({ value, onChange, label, error, tamano = 'normal' }: ArchRatingProps) {
  const nombre = useId();
  const [previa, setPrevia] = useState(0);
  const mostrado = previa || value;

  return (
    <fieldset className={`arch-rating arch-rating--${tamano}`} data-invalid={error ? true : undefined} aria-describedby={error ? `${nombre}-error` : undefined}>
      <legend>{label}</legend>
      <div className="arch-rating__fila" onPointerLeave={() => setPrevia(0)}>
        {PUNTAJES.map((n) => (
          <label
            key={n}
            className="arch-rating__arco"
            data-lleno={n <= mostrado || undefined}
            style={{ '--i': n - 1 } as CSSProperties}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') setPrevia(n);
            }}
          >
            <input type="radio" name={nombre} value={n} checked={value === n} onChange={() => onChange(n)} />
            <span className="sr-only">
              {n} de 5, {TEXTO_PUNTAJE[n].toLowerCase()}
            </span>
          </label>
        ))}
      </div>
      <p className="arch-rating__texto" aria-hidden="true">
        {mostrado ? (
          <>
            <b>{mostrado}</b> de 5 · {TEXTO_PUNTAJE[mostrado]}
          </>
        ) : (
          'Tocá un arco para puntuar'
        )}
      </p>
      {error && (
        <p className="field__error" id={`${nombre}-error`}>
          <Icon name="alert" size={12} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface ArchScoreProps {
  puntaje: number;
  /** 'sm' en tablas y listas; 'lg' en la portada. */
  size?: 'sm' | 'lg';
  /** Sobre el rojo, los arcos van en blanco. */
  inverso?: boolean;
}

/** Puntaje de solo lectura: cinco arcos, llenos hasta el puntaje (admite medios en el promedio). */
export function ArchScore({ puntaje, size = 'sm', inverso = false }: ArchScoreProps) {
  const redondeado = Math.round(puntaje * 2) / 2;
  return (
    <span
      className={`arch-score arch-score--${size}${inverso ? ' arch-score--inverso' : ''}`}
      role="img"
      aria-label={`${puntaje.toLocaleString('es-AR', { maximumFractionDigits: 1 })} de 5`}
    >
      {PUNTAJES.map((n) => (
        <i key={n} data-lleno={n <= redondeado || undefined} data-medio={n - 0.5 === redondeado || undefined} />
      ))}
    </span>
  );
}
