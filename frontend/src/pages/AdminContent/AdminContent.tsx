import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useContenido } from '../../context/ContenidoContext';
import { mensajeDeError } from '../../services/api';
import { catalogoFotos, resolverImagen } from '../../utils/imagenes';
import { plural } from '../../utils/formato';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { ArchImage } from '../../components/ArchImage/ArchImage';
import { CLAVES_EN_OTRA_PANTALLA, GRUPOS, type Campo, type Grupo } from './campos';
import type { Contenido } from '../../types';
import './AdminContent.css';

const OPCIONES_FOTO = [
  { value: '', label: 'Sin foto' },
  ...catalogoFotos.map((f) => ({ value: f.clave, label: f.nombre })),
  { value: 'url', label: 'Otra foto (pegar un enlace)…' }
];

function CampoFoto({ campo, valor, onChange }: { campo: Campo; valor: string; onChange: (v: string) => void }) {
  const delCatalogo = !valor || catalogoFotos.some((f) => f.clave === valor);
  const [modoUrl, setModoUrl] = useState(!delCatalogo);

  return (
    <div className="contenido-foto">
      <ArchImage className="contenido-foto__vista" src={resolverImagen(valor)} alt="" fallbackLabel="Sin foto" aria-hidden="true" />
      <div>
        <SelectField
          label={campo.label}
          options={OPCIONES_FOTO}
          value={modoUrl ? 'url' : valor}
          onChange={(e) => {
            const elegido = e.target.value;
            setModoUrl(elegido === 'url');
            onChange(elegido === 'url' ? '' : elegido);
          }}
        />
        {modoUrl && (
          <TextField label="Enlace de la foto" type="url" inputMode="url" placeholder="https://" value={valor} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}

function FormGrupo({ grupo, items }: { grupo: Grupo; items: Contenido[] }) {
  const toast = useToast();
  const { guardar } = useContenido();
  const original = useMemo(() => new Map(items.map((c) => [c.clave, c.valor])), [items]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const valorDe = (clave: string) => valores[clave] ?? original.get(clave) ?? '';
  const cambiados = Object.entries(valores).filter(([clave, v]) => v !== original.get(clave));
  const campos = grupo.campos.filter((c) => original.has(c.clave));

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (cambiados.length === 0) return;
    setGuardando(true);
    try {
      await guardar(
        cambiados.map(([clave, valor]) => ({ id: items.find((c) => c.clave === clave)?.id ?? 0, valor: valor.trim() })).filter((c) => c.id)
      );
      toast.success(`Guardaste ${plural(cambiados.length, 'cambio')} en ${grupo.titulo}. Ya se ve en el sitio.`);
      setValores({});
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  if (campos.length === 0) return null;

  return (
    <form id={grupo.id} className="contenido-grupo reveal" onSubmit={enviar} aria-labelledby={`${grupo.id}-titulo`} noValidate>
      <div className="contenido-grupo__cabecera">
        <div>
          <h2 id={`${grupo.id}-titulo`}>{grupo.titulo}</h2>
          <p className="muted">{grupo.bajada}</p>
        </div>
      </div>

      <div className="contenido-grupo__campos">
        {campos.map((c) => {
          const valor = valorDe(c.clave);
          const cambiar = (v: string) => setValores((vs) => ({ ...vs, [c.clave]: v }));
          if (c.tipo === 'foto') {
            return (
              <div key={c.clave} className="contenido-grupo__ancho">
                <CampoFoto campo={c} valor={valor} onChange={cambiar} />
              </div>
            );
          }
          if (c.tipo === 'largo') {
            return (
              <div key={c.clave} className="contenido-grupo__ancho">
                <TextAreaField label={c.label} hint={c.ayuda} rows={3} value={valor} onChange={(e) => cambiar(e.target.value)} />
              </div>
            );
          }
          return <TextField key={c.clave} label={c.label} hint={c.ayuda} value={valor} onChange={(e) => cambiar(e.target.value)} />;
        })}
      </div>

      <div className="contenido-grupo__pie" data-sucio={cambiados.length > 0 || undefined}>
        <p className="contenido-grupo__estado" aria-live="polite">
          {cambiados.length > 0 ? `${plural(cambiados.length, 'cambio')} sin guardar` : 'Todo guardado'}
        </p>
        {cambiados.length > 0 && (
          <Button variant="ghost" onClick={() => setValores({})}>
            Descartar
          </Button>
        )}
        <Button type="submit" loading={guardando} disabled={cambiados.length === 0}>
          Guardar {grupo.titulo.toLowerCase()}
        </Button>
      </div>
    </form>
  );
}

/** Todos los textos y las fotos del sitio, agrupados por la pantalla donde aparecen. */
export function AdminContent() {
  const { items } = useContenido();
  const { hash } = useLocation();

  const conocidas = new Set(GRUPOS.flatMap((g) => g.campos.map((c) => c.clave)));
  const otros: Grupo = {
    id: 'otros',
    titulo: 'Otros',
    bajada: 'Textos que se agregaron por la API y todavía no tienen un lugar propio en esta pantalla.',
    campos: items
      .filter((c) => !conocidas.has(c.clave) && !CLAVES_EN_OTRA_PANTALLA.has(c.clave))
      .map((c) => ({ clave: c.clave, label: c.clave, tipo: c.valor.length > 80 ? 'largo' : 'texto' }))
  };
  const grupos = otros.campos.length ? [...GRUPOS, otros] : GRUPOS;

  // los atajos "Editar" de la portada llegan con #portada, #nosotros…
  useEffect(() => {
    if (!hash) return;
    const destino = document.getElementById(hash.slice(1));
    if (!destino) return;
    destino.scrollIntoView({ block: 'start' });
    destino.querySelector<HTMLElement>('input, textarea, select')?.focus({ preventScroll: true });
  }, [hash]);

  return (
    <>
      <PageHeader title="Textos y fotos" lead="Todo lo que dice el sitio fuera de la carta: portada, cards, contacto, cartas y cuadros. Cada bloque se guarda por separado." compact />
      <div className="wrap page contenido">
        <nav className="contenido__indice" aria-label="Bloques de texto">
          <p className="admin-menu__rotulo">Bloques</p>
          <ul>
            {grupos.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>{g.titulo}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="contenido__grupos">
          {grupos.map((g) => (
            <FormGrupo key={g.id} grupo={g} items={items} />
          ))}
        </div>
      </div>
    </>
  );
}
