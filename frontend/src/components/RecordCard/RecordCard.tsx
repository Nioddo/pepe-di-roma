import type { ReactNode } from 'react';
import './RecordCard.css';

interface RecordCardProps {
  /** Lo que va dentro del arco: el día o el número de pedido. */
  arriba: string;
  abajo: string;
  titulo: string;
  meta: ReactNode;
  detalle?: ReactNode;
  acciones?: ReactNode;
  apagado?: boolean;
}

/** Tarjeta + estado + acciones: el mismo patrón para reservas y pedidos. */
export function RecordCard({ arriba, abajo, titulo, meta, detalle, acciones, apagado = false }: RecordCardProps) {
  return (
    <li className="record reveal" data-apagado={apagado || undefined}>
      <div className="record__date" aria-hidden="true">
        <span className="record__top">{arriba}</span>
        <span className="record__bottom">{abajo}</span>
      </div>
      <div className="record__main">
        <h2 className="record__title">{titulo}</h2>
        <div className="record__meta">{meta}</div>
        {detalle && <p className="record__detail">{detalle}</p>}
      </div>
      <div className="record__actions">{acciones}</div>
    </li>
  );
}

export function RecordList({ children }: { children: ReactNode }) {
  return (
    <ul className="records" role="list">
      {children}
    </ul>
  );
}
