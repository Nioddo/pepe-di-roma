import type { ReactNode } from 'react';
import './Notice.css';

interface NoticeProps {
  tono?: 'brand' | 'info' | 'stop';
  children: ReactNode;
}

/** Aviso en línea. "stop" interrumpe (role alert); el resto informa (role status). */
export function Notice({ tono = 'brand', children }: NoticeProps) {
  return (
    <div className={`notice notice--${tono}`} role={tono === 'stop' ? 'alert' : 'status'}>
      <span className="notice__mark" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
