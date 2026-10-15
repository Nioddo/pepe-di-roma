import type { ReactNode } from 'react';
import './Skeleton.css';

/** Contenedor de carga: avisa al lector de pantalla y marca la región como ocupada. */
export function Loading({ label = 'Cargando datos…', children }: { label?: string; children: ReactNode }) {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        {label}
      </p>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function SkeletonBlock({ height, radius = 18 }: { height: number; radius?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: radius }} />;
}

export function SkeletonList({ rows, height }: { rows: number; height: number }) {
  return (
    <Loading>
      <div className="skeleton-list">
        {Array.from({ length: rows }, (_, i) => (
          <SkeletonBlock key={i} height={height} />
        ))}
      </div>
    </Loading>
  );
}
