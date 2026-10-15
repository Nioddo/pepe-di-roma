import { useState, type HTMLAttributes } from 'react';
import './ArchImage.css';

interface ArchImageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src: string | null;
  alt: string;
  loading?: 'lazy' | 'eager';
  /** Texto para el lector de pantalla cuando no hay foto. */
  fallbackLabel?: string;
}

/**
 * Foto recortada con el arco del logotipo. Si el plato no tiene imagen
 * (o la URL no carga), muestra el papel de la caja con el mismo arco.
 */
export function ArchImage({ src, alt, className = '', loading = 'lazy', fallbackLabel, ...rest }: ArchImageProps) {
  const [rota, setRota] = useState(false);
  const sinFoto = !src || rota;

  return (
    <div className={`arch-image ${className}`} {...rest}>
      {sinFoto ? (
        <div className="arch-image__fallback paper" role="img" aria-label={fallbackLabel ?? `${alt}, sin foto`} />
      ) : (
        <img src={src} alt={alt} loading={loading} onError={() => setRota(true)} />
      )}
    </div>
  );
}
