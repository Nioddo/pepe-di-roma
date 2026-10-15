import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useContenido } from '../../context/ContenidoContext';
import { useApi } from '../../hooks/useApi';
import { useCartas } from '../../hooks/useSitio';
import { createCalificacion, deleteCalificacion, getCalificaciones } from '../../services/calificacionesService';
import { getCarta } from '../../services/seccionesService';
import { getPedidosDeCliente } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { formatearFecha } from '../../utils/formato';
import { hayErrores, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ArchRating, ArchScore } from '../../components/ArchRating/ArchRating';
import { SelectField, TextAreaField, TextField, type GrupoOpciones } from '../../components/Field/Field';
import { Button, ButtonLink } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import type { Calificacion, Plato, Usuario } from '../../types';
import './Survey.css';

type Campo = 'puntaje' | 'mensaje' | 'firma';

const LARGO_MENSAJE = 500;
const LARGO_FIRMA = 40;

/** "martin.perez@mail.com" → "Martin Perez": una firma para empezar, que el cliente puede cambiar. */
function firmaSugerida(usuario: Usuario): string {
  return usuario.email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
    .slice(0, LARGO_FIRMA);
}

// sin cuenta también se puede opinar: solo se saltean los pedidos propios
const cargarPara = (usuarioId: number | null) => () =>
  Promise.all([getCarta(), usuarioId ? getPedidosDeCliente(usuarioId) : Promise.resolve([]), getCalificaciones()]);

/** Encuesta: el cliente puntúa lo que comió y le deja un mensaje al local. */
export function Survey() {
  const { usuario } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const { texto } = useContenido();
  const { cartas } = useCartas();
  const [params] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const usuarioId = usuario?.id ?? null;
  const { data, loading, error, recargar } = useApi(cargarPara(usuarioId), [usuarioId]);
  const [carta, pedidos, calificaciones] = data ?? [null, [], []];

  const [puntaje, setPuntaje] = useState(() => {
    const pedido = Number(params.get('puntaje'));
    return Number.isInteger(pedido) && pedido >= 1 && pedido <= 5 ? pedido : 0;
  });
  const [platoId, setPlatoId] = useState(params.get('plato') ?? '');
  const [mensaje, setMensaje] = useState('');
  const [firma, setFirma] = useState(usuario ? firmaSugerida(usuario) : '');
  // como en la encuesta del local: atención, platos y el lugar, más quién te atendió
  const [aspectos, setAspectos] = useState({ atencion: 0, comida: 0, espacio: 0 });
  const [mozo, setMozo] = useState('');
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);
  const [publicada, setPublicada] = useState<Calificacion | null>(null);
  const [borrando, setBorrando] = useState<number | null>(null);

  const platos = carta?.platos ?? [];
  const platoDe = (id: number | null): Plato | undefined => platos.find((p) => p.id === id);
  const mias = usuarioId ? calificaciones.filter((c) => c.usuarioId === usuarioId).sort((a, b) => b.id - a.id) : [];
  // sin sesión, al costado van las mejores opiniones de otros clientes
  const otras = calificaciones
    .filter((c) => c.visible)
    .sort((a, b) => b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha))
    .slice(0, 3);
  const lista = usuario ? mias : otras;

  // primero lo que el cliente pidió; después, cada carta con sus platos
  const grupos = useMemo<GrupoOpciones[]>(() => {
    if (!carta) return [];
    const pedidosIds = new Set(pedidos.filter((p) => p.estado !== 'CANCELADO').flatMap((p) => p.items.map((it) => it.platoId)));
    const opcion = (p: Plato) => ({ value: String(p.id), label: p.nombre });
    return [
      { label: 'De tus pedidos', options: carta.platos.filter((p) => pedidosIds.has(p.id)).map(opcion) },
      ...cartas.map((c) => ({
        label: c.nombre,
        options: carta.porCarta[c.id].flatMap((s) => s.platosDetalle).map(opcion)
      }))
    ];
  }, [carta, pedidos, cartas]);

  const limpiar = (campo: Campo) => setErrores((e) => ({ ...e, [campo]: '' }));

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const nuevos: Errores<Campo> = {
      puntaje: puntaje ? '' : 'Elegí un puntaje: tocá uno de los cinco arcos.',
      mensaje: validarRequerido(mensaje, 'Escribí un mensaje para el local.'),
      firma: validarRequerido(firma, 'Decinos cómo querés firmar.')
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(formRef.current);
      return;
    }

    setEnviando(true);
    try {
      const creada = await createCalificacion({
        usuarioId,
        firma: firma.trim(),
        puntaje,
        mensaje: mensaje.trim(),
        platoId: platoId ? Number(platoId) : null,
        atencion: aspectos.atencion || null,
        comida: aspectos.comida || null,
        espacio: aspectos.espacio || null,
        mozo: mozo.trim() || null
      });
      toast.success(texto('encuesta.gracias'));
      setPublicada(creada);
      setPuntaje(0);
      setMensaje('');
      setPlatoId('');
      setAspectos({ atencion: 0, comida: 0, espacio: 0 });
      setMozo('');
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (c: Calificacion) => {
    const ok = await confirmar({
      titulo: '¿Borrar tu opinión?',
      texto: `¿Seguro que querés borrar la opinión del ${formatearFecha(c.fecha)}? Deja de verse en la portada.`
    });
    if (!ok) return;
    setBorrando(c.id);
    try {
      await deleteCalificacion(c.id);
      toast.success('Borraste tu opinión.');
      if (publicada?.id === c.id) setPublicada(null);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setBorrando(null);
    }
  };

  let formulario;
  if (loading) {
    formulario = (
      <Loading label="Preparando la encuesta…">
        <SkeletonBlock height={520} />
      </Loading>
    );
  } else if (error) {
    formulario = <EmptyState title="No pudimos abrir la encuesta" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (publicada) {
    formulario = (
      <div className="encuesta-gracias" role="status">
        <p className="encuesta-gracias__titulo">Grazie mille</p>
        <ArchScore puntaje={publicada.puntaje} size="lg" inverso />
        <p className="encuesta-gracias__texto">{texto('encuesta.gracias')}</p>
        <div className="encuesta-gracias__acciones">
          <ButtonLink to="/#opiniones" variant="inverse">
            Verla en la portada
          </ButtonLink>
          <Button variant="ghost" className="encuesta-gracias__otra" onClick={() => setPublicada(null)}>
            Escribir otra
          </Button>
        </div>
      </div>
    );
  } else {
    formulario = (
      <form ref={formRef} className="panel-form encuesta" onSubmit={enviar} noValidate>
        <ArchRating
          label="¿Cuánto le das?"
          value={puntaje}
          error={errores.puntaje}
          onChange={(v) => {
            setPuntaje(v);
            limpiar('puntaje');
          }}
        />
        <SelectField
          label="¿Qué comiste? (opcional)"
          hint={usuario ? 'Tus platos pedidos por la web aparecen primero.' : undefined}
          options={[{ value: '', label: 'Prefiero no decirlo' }]}
          grupos={grupos}
          value={platoId}
          onChange={(e) => setPlatoId(e.target.value)}
        />
        <fieldset className="encuesta__aspectos">
          <legend>Si querés, contanos un poco más (opcional)</legend>
          <ArchRating tamano="chico" label="Atención" value={aspectos.atencion} onChange={(v) => setAspectos((a) => ({ ...a, atencion: v }))} />
          <ArchRating tamano="chico" label="Platos" value={aspectos.comida} onChange={(v) => setAspectos((a) => ({ ...a, comida: v }))} />
          <ArchRating tamano="chico" label="El lugar" value={aspectos.espacio} onChange={(v) => setAspectos((a) => ({ ...a, espacio: v }))} />
          <TextField label="¿Quién te atendió? (opcional)" maxLength={40} value={mozo} onChange={(e) => setMozo(e.target.value)} />
        </fieldset>
        <TextAreaField
          label="Tu mensaje para el local"
          maxLength={LARGO_MENSAJE}
          value={mensaje}
          error={errores.mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
            limpiar('mensaje');
          }}
        />
        <TextField
          label="Cómo querés firmar"
          hint={usuario ? 'Así aparece en la portada. Tu email no se muestra.' : 'Tu nombre o como quieras aparecer en la portada.'}
          maxLength={LARGO_FIRMA}
          value={firma}
          error={errores.firma}
          onChange={(e) => {
            setFirma(e.target.value);
            limpiar('firma');
          }}
        />
        <Button type="submit" block loading={enviando}>
          Publicar opinión
        </Button>
      </form>
    );
  }

  return (
    <>
      <PageHeader title={texto('encuesta.titulo')} lead={texto('encuesta.bajada')} />
      <div className="wrap page split split--reverse">
        <div className="reveal">{formulario}</div>

        <section className="encuesta-mias reveal" aria-labelledby="mias-titulo">
          <h2 id="mias-titulo" className="section-title">
            {usuario ? 'Tus opiniones' : 'Lo que dicen otros'}
            {usuario && mias.length > 0 && <span className="count">{mias.length}</span>}
          </h2>
          {loading ? (
            <Loading>
              <SkeletonBlock height={120} />
            </Loading>
          ) : lista.length === 0 ? (
            <p className="empty-inline">
              {usuario ? 'Todavía no opinaste. Lo que publiques aparece acá y en la portada.' : 'Todavía nadie opinó. La tuya puede ser la primera.'}
            </p>
          ) : (
            <ul className="encuesta-mias__lista" role="list">
              {lista.map((c) => {
                const plato = platoDe(c.platoId);
                return (
                  <li key={c.id} className="encuesta-mia">
                    <div className="encuesta-mia__cabeza">
                      <ArchScore puntaje={c.puntaje} />
                      {!c.visible && <Badge tono="off">Oculta por el local</Badge>}
                    </div>
                    <p className="encuesta-mia__texto">{c.mensaje}</p>
                    <p className="encuesta-mia__meta">
                      {formatearFecha(c.fecha)}
                      {plato && ` · ${plato.nombre}`} · {usuario ? `firmada como ${c.firma}` : c.firma}
                    </p>
                    {c.respuesta && (
                      <p className="opinion__respuesta">
                        <b>Pepe responde:</b> {c.respuesta}
                      </p>
                    )}
                    {usuario && (
                      <Button variant="danger-quiet" size="sm" loading={borrando === c.id} onClick={() => borrar(c)}>
                        Borrar
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
