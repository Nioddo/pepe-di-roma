import type { ReactNode } from 'react';

export type IconName = 'check' | 'alert' | 'close' | 'arrow' | 'prev' | 'next' | 'picante' | 'vegano' | 'menu' | 'lapiz' | 'up' | 'down' | 'mover';

interface IconProps {
  name: IconName;
  size?: number;
}

const PATHS: Record<IconName, ReactNode> = {
  check: <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  alert: (
    <>
      <path d="M8 3.2v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="8" cy="12.6" r="1.4" fill="currentColor" />
    </>
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  arrow: <path d="M4.3 11.7L11.7 4.3M5.7 4.3h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />,
  prev: <path d="M10 3.6L5.6 8l4.4 4.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  next: <path d="M6 3.6L10.4 8 6 12.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  lapiz: <path d="M10.6 2.9l2.5 2.5-7.4 7.4-3.2.7.7-3.2 7.4-7.4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  up: <path d="M3.6 10L8 5.6l4.4 4.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  down: <path d="M3.6 6L8 10.4 12.4 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  mover: (
    <path
      d="M8 1.8v12.4M1.8 8h12.4M6 3.8l2-2 2 2M6 12.2l2 2 2-2M3.8 6l-2 2 2 2M12.2 6l2 2-2 2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  picante: (
    <>
      <path d="M10.3 4.4c1.7.3 2.4 2 1.6 3.8-1.4 3-4.9 5.3-8.5 5.7-.6.1-.9-.6-.3-.9 2.5-1.4 4.2-3.5 4.8-6.1.4-1.7 1.2-2.7 2.4-2.5z" fill="currentColor" />
      <path d="M10.4 4.4c.2-1.2.9-2 2-2.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  vegano: (
    <>
      <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 11.5c-2.6-.2-3.9-2.2-3.4-4.9 2.4.1 3.7 1.6 3.4 4.9zm0 0c2.6-.2 3.9-2.2 3.4-4.9-2.4.1-3.7 1.6-3.4 4.9z" fill="currentColor" />
    </>
  )
};

export function Icon({ name, size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
