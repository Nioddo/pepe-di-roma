import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import './Field.css';

interface Comunes {
  label: string;
  error?: string;
  hint?: string;
}

interface ShellProps extends Comunes {
  id: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, children }: ShellProps) {
  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <span className="field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  const ids = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

type TextFieldProps = Comunes & InputHTMLAttributes<HTMLInputElement>;

/** Input con label visible, ayuda opcional y error debajo del campo. */
export function TextField({ label, error, hint, id, ...input }: TextFieldProps) {
  const generado = useId();
  const campoId = id ?? generado;
  return (
    <FieldShell id={campoId} label={label} error={error} hint={hint}>
      <input
        id={campoId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(campoId, error, hint)}
        {...input}
      />
    </FieldShell>
  );
}

export interface Opcion {
  value: string;
  label: string;
}

type SelectFieldProps = Comunes &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Opcion[];
  };

export function SelectField({ label, error, hint, id, options, ...select }: SelectFieldProps) {
  const generado = useId();
  const campoId = id ?? generado;
  return (
    <FieldShell id={campoId} label={label} error={error} hint={hint}>
      <select
        id={campoId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(campoId, error, hint)}
        {...select}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Check({ label, ...input }: CheckProps) {
  return (
    <label className="check">
      <input type="checkbox" {...input} />
      {label}
    </label>
  );
}

/** Error suelto (por ejemplo, debajo del mapa de mesas o del carrito). */
export function InlineError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className="field__error field__error--block" id={id} role="alert">
      <Icon name="alert" size={12} />
      {children}
    </p>
  );
}
