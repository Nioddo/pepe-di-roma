import { PageHeader } from '../../components/PageHeader/PageHeader';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ButtonLink } from '../../components/Button/Button';

export function NotFound() {
  return (
    <>
      <PageHeader title="Página no encontrada" compact />
      <div className="wrap page">
        <EmptyState
          title="Esta página no existe"
          text="Puede que el enlace esté mal escrito o que la página se haya movido."
          action={<ButtonLink to="/">Volver al inicio</ButtonLink>}
        />
      </div>
    </>
  );
}
