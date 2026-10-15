import { Fragment, type CSSProperties, type ReactNode } from 'react';
import './DataTable.css';

export interface Columna<T> {
  clave: string;
  titulo: string;
  render: (fila: T) => ReactNode;
  /** El título queda solo para lectores de pantalla (columna de acciones). */
  tituloOculto?: boolean;
  numerica?: boolean;
}

interface DataTableProps<T> {
  columnas: Columna<T>[];
  filas: T[];
  getKey: (fila: T) => string | number;
  caption?: string;
  /** El caption repite un título visible: queda solo para lectores de pantalla. */
  captionOculta?: boolean;
  minWidth?: number;
  /** Contenido que se despliega debajo de una fila (el formulario para editarla). */
  detalle?: (fila: T) => ReactNode;
}

/** Tabla de gestión: semántica real (caption, th con scope) y scroll lateral en pantallas chicas. */
export function DataTable<T>({ columnas, filas, getKey, caption, captionOculta = false, minWidth = 620, detalle }: DataTableProps<T>) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption ?? 'Tabla'}>
      <table className="data-table" style={{ '--min-width': `${minWidth}px` } as CSSProperties}>
        {caption && <caption className={captionOculta ? 'sr-only' : undefined}>{caption}</caption>}
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} scope="col">
                {c.tituloOculto ? <span className="sr-only">{c.titulo}</span> : c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const abierto = detalle?.(fila);
            return (
              <Fragment key={getKey(fila)}>
                <tr data-abierta={abierto ? true : undefined}>
                  {columnas.map((c) => (
                    <td key={c.clave} className={c.numerica ? 'is-num' : undefined} data-label={c.tituloOculto ? undefined : c.titulo}>
                      {c.render(fila)}
                    </td>
                  ))}
                </tr>
                {abierto && (
                  <tr className="data-table__detalle">
                    <td colSpan={columnas.length}>{abierto}</td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="row-actions">{children}</div>;
}
