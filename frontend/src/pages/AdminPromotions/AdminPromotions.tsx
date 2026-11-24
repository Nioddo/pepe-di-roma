import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { enviarPromocion, getDestinatarios } from '../../services/promocionesService';
import { mensajeDeError } from '../../services/api';
import { hayErrores, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { TextAreaField, TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonBlock } from '../../components/Skeleton/Skeleton';
import './AdminPromotions.css';

type Campo = 'asunto' | 'mensaje' | 'imagen' | 'botonTexto' | 'botonLink';

const MAX_ASUNTO = 120;
const MAX_MENSAJE = 5000;
const MAX_BOTON = 40;

function esHttps(valor: string): boolean {
  try {
    return new URL(valor).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Mensaje de promociones para todas las cuentas registradas. */
export function AdminPromotions() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(getDestinatarios);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [titulo, setTitulo] = useState('');
  const [imagen, setImagen] = useState('');
  const [botonTexto, setBotonTexto] = useState('');
  const [botonLink, setBotonLink] = useState('');
  const [imagenRota, setImagenRota] = useState(false);
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);

  const total = data?.total ?? 0;

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const nuevos = {
      asunto: validarRequerido(asunto, 'Escribí el asunto del mail.'),
      mensaje: validarRequerido(mensaje, 'Escribí el mensaje.'),
      imagen: imagen.trim() && !esHttps(imagen.trim()) ? 'El link de la imagen tiene que empezar con https://' : '',
      botonTexto: botonLink.trim() && !botonTexto.trim() ? 'Escribí qué dice el botón.' : '',
      botonLink:
        (botonLink.trim() || botonTexto.trim()) && !esHttps(botonLink.trim())
          ? 'El link del botón tiene que empezar con https://'
          : ''
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(formulario);
      return;
    }

    const ok = await confirmar({
      titulo: '¿Enviar el mensaje?',
      texto: `Se va a enviar un mail a ${total} ${total === 1 ? 'cuenta' : 'cuentas'}. No se puede deshacer.`
    });
    if (!ok) return;

    setEnviando(true);
    try {
      const resultado = await enviarPromocion({
        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
        titulo: titulo.trim(),
        imagen: imagen.trim(),
        botonTexto: botonTexto.trim(),
        botonLink: botonLink.trim()
      });
      if (resultado.fallidos.length > 0) {
        toast.error(`Se enviaron ${resultado.enviados} de ${resultado.total}. Fallaron: ${resultado.fallidos.join(', ')}.`);
      } else {
        toast.success(`Enviaste el mensaje a ${resultado.enviados} ${resultado.enviados === 1 ? 'cuenta' : 'cuentas'}.`);
      }
      setAsunto('');
      setMensaje('');
      setTitulo('');
      setImagen('');
      setBotonTexto('');
      setBotonLink('');
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  let contenido;
  if (loading) {
    contenido = <SkeletonBlock height={320} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar los destinatarios" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    contenido = (
      <div className="admin-promos">
      <form className="admin-promos__form" onSubmit={enviar} noValidate>
        <p className="admin-promos__destino">
          Se envía a <strong>{total}</strong> {total === 1 ? 'cuenta registrada' : 'cuentas registradas'}.
        </p>
        <TextField
          label="Asunto"
          maxLength={MAX_ASUNTO}
          value={asunto}
          error={errores.asunto}
          onChange={(e) => {
            setAsunto(e.target.value);
            setErrores((er) => ({ ...er, asunto: '' }));
          }}
        />
        <TextField
          label="Título dentro del mail (opcional)"
          maxLength={MAX_ASUNTO}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <TextField
          label="Foto o banner (opcional)"
          type="url"
          inputMode="url"
          hint="Link de la imagen, que empiece con https://"
          value={imagen}
          error={errores.imagen}
          onChange={(e) => {
            setImagen(e.target.value);
            setImagenRota(false);
            setErrores((er) => ({ ...er, imagen: '' }));
          }}
        />
        <TextAreaField
          label="Mensaje"
          rows={10}
          maxLength={MAX_MENSAJE}
          hint="Una línea en blanco separa los párrafos."
          value={mensaje}
          error={errores.mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
            setErrores((er) => ({ ...er, mensaje: '' }));
          }}
        />
        <div className="admin-promos__boton-campos">
          <TextField
            label="Texto del botón (opcional)"
            maxLength={MAX_BOTON}
            value={botonTexto}
            error={errores.botonTexto}
            onChange={(e) => {
              setBotonTexto(e.target.value);
              setErrores((er) => ({ ...er, botonTexto: '' }));
            }}
          />
          <TextField
            label="Link del botón"
            type="url"
            inputMode="url"
            hint="Por ejemplo, el link de tu carta o de reservas"
            value={botonLink}
            error={errores.botonLink}
            onChange={(e) => {
              setBotonLink(e.target.value);
              setErrores((er) => ({ ...er, botonLink: '' }));
            }}
          />
        </div>
        <div className="admin-promos__pie">
          <Button type="submit" loading={enviando} disabled={total === 0}>
            Enviar a todos
          </Button>
        </div>
      </form>
      <section className="admin-promos__vista" aria-labelledby="vista-titulo">
        <h2 className="admin-promos__vista-titulo" id="vista-titulo">Así lo van a ver</h2>
        <div className="admin-promos__mail">
          <p className="admin-promos__asunto">Asunto: {asunto.trim() || '—'}</p>
          <div className="admin-promos__cuerpo">
            <p className="admin-promos__marca">Pepe Di Roma</p>
            {imagen.trim() && esHttps(imagen.trim()) && !imagenRota && (
              <img
                className="admin-promos__banner"
                src={imagen.trim()}
                alt=""
                onError={() => setImagenRota(true)}
              />
            )}
            {imagenRota && <p className="admin-promos__vacio admin-promos__aviso">No se pudo cargar la imagen. Revisá el link.</p>}
            <div className="admin-promos__texto">
              {titulo.trim() && <h3 className="admin-promos__titulo">{titulo.trim()}</h3>}
              {mensaje.trim() ? (
                mensaje
                  .trim()
                  .split(/\n{2,}/)
                  .map((parrafo, i) => <p key={i}>{parrafo}</p>)
              ) : (
                <p className="admin-promos__vacio">El mensaje aparece acá a medida que lo escribís.</p>
              )}
              {botonTexto.trim() && botonLink.trim() && (
                <span className="admin-promos__cta">{botonTexto.trim()}</span>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Promociones"
        lead="Mandá un mail con una promoción, una novedad o un aviso a todas las cuentas registradas."
        compact
      />
      <div className="wrap page">{contenido}</div>
    </>
  );
}
