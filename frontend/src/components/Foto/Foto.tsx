import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { catalogoFotos, resolverImagen } from '../../utils/imagenes';
import { ArchImage } from '../ArchImage/ArchImage';
import { TextField } from '../Field/Field';
import { Icon } from '../Icon/Icon';
import './Foto.css';

interface FotoVisorProps {
  src: string;
  titulo: string;
  onCerrar: () => void;
}

/**
 * La foto en grande, en un modal nativo (<dialog>): Escape, la cruz o un toque
 * afuera la cierran, y el foco vuelve a la miniatura que la abrió.
 */
export function FotoVisor({ src, titulo, onCerrar }: FotoVisorProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const disparador = document.activeElement as HTMLElement | null;
    if (!ref.current?.open) ref.current?.showModal();
    return () => disparador?.focus();
  }, []);

  const cerrar = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="modal visor"
      aria-label={titulo}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <img src={src} alt={titulo} />
      <div className="visor__pie">
        <span>{titulo}</span>
        <button type="button" className="visor__cerrar" aria-label="Cerrar la foto" onClick={cerrar}>
          <Icon name="close" size={16} />
        </button>
      </div>
    </dialog>
  );
}

interface FotoAmpliableProps {
  src: string | null;
  titulo: string;
  /** La miniatura que se ve en la lista. */
  children: ReactNode;
}

/** Envuelve una miniatura: al tocarla, se ve en grande. Sin foto, queda como estaba. */
export function FotoAmpliable({ src, titulo, children }: FotoAmpliableProps) {
  const [abierta, setAbierta] = useState(false);
  if (!src) return <>{children}</>;

  return (
    <>
      <button type="button" className="foto-zoom" aria-label={`Ver en grande la foto de ${titulo}`} onClick={() => setAbierta(true)}>
        {children}
      </button>
      {abierta && <FotoVisor src={src} titulo={titulo} onCerrar={() => setAbierta(false)} />}
    </>
  );
}

interface FotoPickerProps {
  label: string;
  /** "" sin foto, la clave del catálogo ("platos/…jpg") o un enlace. */
  value: string;
  onChange: (valor: string) => void;
  /** Ofrecer "Otra foto (enlace)". */
  conEnlace?: boolean;
  error?: string;
}

/**
 * Elegir foto viéndola: la grilla del catálogo como un grupo de radios
 * (se recorre con las flechas) y arriba la elegida, que se amplía al tocarla.
 */
export function FotoPicker({ label, value, onChange, conEnlace = true, error }: FotoPickerProps) {
  const grupo = useId();
  const [modoUrl, setModoUrl] = useState(() => !!value && !catalogoFotos.some((f) => f.clave === value));
  const vista = resolverImagen(value);
  const titulo = catalogoFotos.find((f) => f.clave === value)?.nombre ?? (value ? 'Foto del enlace' : 'Sin foto');

  const elegir = (valor: string, enlace = false) => {
    setModoUrl(enlace);
    onChange(valor);
  };

  return (
    <fieldset className="foto-picker">
      <legend>{label}</legend>

      <div className="foto-picker__actual">
        <FotoAmpliable src={vista} titulo={titulo}>
          <ArchImage className="foto-picker__vista" src={vista} alt="" fallbackLabel="Sin foto" aria-hidden="true" />
        </FotoAmpliable>
        <div>
          <p className="foto-picker__nombre">{titulo}</p>
          <p className="foto-picker__ayuda">{vista ? 'Tocá la foto para verla en grande.' : 'Elegí una de abajo.'}</p>
        </div>
      </div>

      <div className="foto-picker__grilla">
        <label className="foto-picker__op foto-picker__op--texto">
          <input type="radio" name={grupo} checked={!modoUrl && !value} onChange={() => elegir('')} />
          <span>Sin foto</span>
        </label>
        {catalogoFotos.map((f) => (
          <label key={f.clave} className="foto-picker__op" title={f.nombre}>
            <input type="radio" name={grupo} checked={!modoUrl && value === f.clave} onChange={() => elegir(f.clave)} />
            <img src={f.url} alt="" loading="lazy" />
            <span className="sr-only">{f.nombre}</span>
          </label>
        ))}
        {conEnlace && (
          <label className="foto-picker__op foto-picker__op--texto">
            <input type="radio" name={grupo} checked={modoUrl} onChange={() => elegir('', true)} />
            <span>Otra foto (enlace)</span>
          </label>
        )}
      </div>

      {modoUrl && (
        <TextField
          label="Enlace de la foto"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={value}
          error={error}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </fieldset>
  );
}
