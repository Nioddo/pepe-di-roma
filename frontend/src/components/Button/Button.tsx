import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-quiet' | 'ghost' | 'inverse';

interface Apariencia {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  block?: boolean;
}

function clases({ variant = 'primary', size = 'md', block = false }: Apariencia, extra = ''): string {
  return ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', extra]
    .filter(Boolean)
    .join(' ');
}

interface ButtonProps extends Apariencia, ComponentProps<'button'> {
  loading?: boolean;
  children: ReactNode;
}

/** Acción: envía, confirma, elimina. */
export function Button({
  variant,
  size,
  block,
  loading = false,
  className,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clases({ variant, size, block }, className)}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="btn__label">{children}</span>
    </button>
  );
}

interface ButtonLinkProps extends Apariencia, LinkProps {
  children: ReactNode;
}

/** Navegación con aspecto de botón: sigue siendo un enlace para el lector de pantalla. */
export function ButtonLink({ variant, size, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={clases({ variant, size, block }, className)} {...rest}>
      <span className="btn__label">{children}</span>
    </Link>
  );
}
