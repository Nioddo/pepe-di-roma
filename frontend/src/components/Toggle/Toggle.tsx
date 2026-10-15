import './Toggle.css';

interface ToggleProps<T extends string> {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Selector segmentado: una sola opción activa, marcada con aria-pressed. */
export function Toggle<T extends string>({ legend, options, value, onChange }: ToggleProps<T>) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="toggle">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
