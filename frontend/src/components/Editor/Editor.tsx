import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import './Editor.css';

interface EditorProps {
  titulo: string;
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
  onCancelar: () => void;
  guardando?: boolean;
  textoGuardar?: string;
  children: ReactNode;
  /** Acciones extra a la izquierda del pie (por ejemplo, Eliminar). */
  extra?: ReactNode;
}

/**
 * Formulario de edición en el lugar: se abre debajo de la fila que se edita,
 * lleva el foco a su título y se cierra con Escape o con "Cancelar".
 */
export function Editor({ titulo, onSubmit, onCancelar, guardando = false, textoGuardar = 'Guardar cambios', children, extra }: EditorProps) {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
    tituloRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);

  return (
    <form
      className="editor"
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancelar();
      }}
      noValidate
    >
      <h3 className="editor__titulo" ref={tituloRef} tabIndex={-1}>
        {titulo}
      </h3>
      <div className="editor__campos">{children}</div>
      <div className="editor__pie">
        <div className="editor__extra">{extra}</div>
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {textoGuardar}
        </Button>
      </div>
    </form>
  );
}
