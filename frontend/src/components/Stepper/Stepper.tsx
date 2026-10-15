import './Stepper.css';

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function Stepper({ label, value, onChange, max = 99 }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" aria-label={`Quitar un ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>
        −
      </button>
      <output aria-live="polite">
        {/* la región que anuncia queda fija; lo que late es el número de adentro */}
        <span key={value} className="stepper__valor" data-cambio={value > 0 || undefined}>
          {value}
        </span>
      </output>
      <button type="button" aria-label={`Agregar un ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
