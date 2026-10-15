import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTono = 'brand' | 'veg' | 'tacc' | 'ok' | 'warn' | 'info' | 'off' | 'danger';

interface BadgeProps {
  tono?: BadgeTono;
  children: ReactNode;
}

export function Badge({ tono = 'brand', children }: BadgeProps) {
  return <span className={`badge badge--${tono}`}>{children}</span>;
}
