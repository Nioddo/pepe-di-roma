import { useEffect, useRef, useState } from 'react';
import { formatearPrecio } from '../../utils/formato';
import { validarPrecio } from '../../utils/validacion';
import { Icon } from '../../components/Icon/Icon';

interface PrecioEnLineaProps {
  nombre: string;
  precio: number;
  onGuardar: (precio: number) => Promise<unknown>;
}

/**
 * El precio es lo que más se cambia de la carta: se toca, se escribe y Enter.
 * Escape o salir del campo sin un precio válido lo deja como estaba.
 */
export function PrecioEnLinea({ nombre, precio, onGuardar }: PrecioEnLineaProps) {
  const [valor, setValor] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [invalido, setInvalido] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const abierto = valor !== null;

  useEffect(() => {
    if (!abierto) return;
    campo.current?.focus();
    campo.current?.select();
  }, [abierto]);

  if (valor === null) {
    return (
      <button type="button" className="precio-linea" aria-label={`Precio de ${nombre}: ${formatearPrecio(precio)}. Cambiar.`} onClick={() => setValor(String(precio))}>
        {formatearPrecio(precio)}
        <Icon name="lapiz" size={14} />
      </button>
    );
  }

  const cerrar = () => {
    setValor(null);
    setInvalido(false);
  };

  const confirmar = async (alSalir: boolean) => {
    if (guardando) return;
    if (validarPrecio(valor)) {
      if (alSalir) cerrar();
      else setInvalido(true);
      return;
    }
    const nuevo = Number(valor);
    if (nuevo === precio) {
      cerrar();
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(nuevo);
    } finally {
      setGuardando(false);
      cerrar();
    }
  };

  return (
    <form
      className="precio-linea__form"
      data-invalido={invalido || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        confirmar(false);
      }}
    >
      <span aria-hidden="true">$</span>
      <input
        ref={campo}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        value={valor}
        readOnly={guardando}
        aria-label={`Precio de ${nombre}, en pesos. Enter guarda, Escape cancela.`}
        aria-invalid={invalido || undefined}
        onChange={(e) => {
          setValor(e.target.value);
          setInvalido(false);
        }}
        onBlur={() => confirmar(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') cerrar();
        }}
      />
    </form>
  );
}
