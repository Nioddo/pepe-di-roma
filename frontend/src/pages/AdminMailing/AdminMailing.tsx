import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useContenido } from '../../context/ContenidoContext';
import { useApi } from '../../hooks/useApi';
import { useContacto } from '../../hooks/useSitio';
import { enviarDifusion, getDifusion } from '../../services/difusionService';
import { getUsuarios } from '../../services/usuariosService';
import { getPlatos } from '../../services/platosService';
import { mensajeDeError } from '../../services/api';
import { armarMail, fotoEmbebida, type MailDatos } from '../../utils/mail';
import { resolverImagen } from '../../utils/imagenes';
import { formatearFechaHora, plural } from '../../utils/formato';
import { hayErrores, validarEmail, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { Check, SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { FotoPicker } from '../../components/Foto/Foto';
import { Toggle } from '../../components/Toggle/Toggle';
import { Button } from '../../components/Button/Button';
import { Notice } from '../../components/Notice/Notice';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import './AdminMailing.css';

type Campo = 'asunto' | 'titulo' | 'mensaje';
type Destino = 'todos' | 'elegir';
type Ancho = 'compu' | 'celu';

const BOTONES = [
  { value: '/menu', label: 'Ver la carta' },
  { value: '/reservar', label: 'Reservar una mesa' },
  { value: '/pedido', label: 'Hacer un pedido' },
  { value: '', label: 'Sin botón' }
];

/** Dirección pública de una pantalla del sitio, para el botón del mail. */
function enlaceDelSitio(ruta: string): string {
  const { origin, href, hash } = window.location;
  return hash.startsWith('#/') ? `${href.split('#')[0]}#${ruta}` : `${origin}${ruta}`;
}

/** Armar y mandar el mail de novedades o promociones a los clientes. */
export function AdminMailing() {
  const { usuario } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const { texto } = useContenido();
  const contacto = useContacto();
  const estado = useApi(getDifusion);
  const usuarios = useApi(getUsuarios);
  const platos = useApi(getPlatos);
  const formulario = useRef<HTMLDivElement>(null);

  const [asunto, setAsunto] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [foto, setFoto] = useState('');
  const [oferta, setOferta] = useState('');
  const [vigencia, setVigencia] = useState('');
  const [boton, setBoton] = useState('/menu');
  const [errores, setErrores] = useState<Errores<Campo>>({});

  const [ancho, setAncho] = useState<Ancho>('compu');
  const [destino, setDestino] = useState<Destino>('todos');
  const [elegidos, setElegidos] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState('');
  const [casillaPrueba, setCasillaPrueba] = useState(usuario?.email ?? '');
  const [errorPrueba, setErrorPrueba] = useState('');
  const [enviando, setEnviando] = useState<'prueba' | 'todos' | null>(null);

  const clientes = useMemo(() => (usuarios.data ?? []).filter((u) => u.rol === 'CLIENTE'), [usuarios.data]);
  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return q ? clientes.filter((c) => c.email.toLowerCase().includes(q)) : clientes;
  }, [clientes, filtro]);
  const destinatarios = destino === 'todos' ? clientes.map((c) => c.id) : clientes.filter((c) => elegidos.has(c.id)).map((c) => c.id);

  const local = useMemo(
    () => ({
      lema: texto('sitio.lema'),
      direccion: contacto.direccion,
      barrio: contacto.barrio,
      dias: contacto.dias,
      horario: contacto.horario,
      horarioExtendido: contacto.horarioExtendido,
      telefono: contacto.telefono,
      instagram: contacto.instagram,
      instagramUrl: contacto.instagramUrl
    }),
    [texto, contacto.direccion, contacto.barrio, contacto.dias, contacto.horario, contacto.horarioExtendido, contacto.telefono, contacto.instagram, contacto.instagramUrl]
  );

  const datos = (fotoUrl: string | null): MailDatos => ({
    asunto,
    titulo,
    mensaje,
    foto: fotoUrl,
    oferta,
    vigencia,
    botonTexto: BOTONES.find((b) => b.value === boton)?.label ?? '',
    botonUrl: boton ? enlaceDelSitio(boton) : ''
  });

  const vistaFoto = resolverImagen(foto);
  const previa = armarMail(datos(vistaFoto), local, true).html;

  const traerPlato = (id: string) => {
    const plato = platos.data?.find((p) => String(p.id) === id);
    if (!plato) return;
    setTitulo(plato.nombre);
    if (plato.descripcion) setMensaje(plato.descripcion);
    setFoto(plato.imageUrl ?? '');
    if (!asunto.trim()) setAsunto(plato.nombre);
  };

  const alternar = (id: number) =>
    setElegidos((previos) => {
      const nuevos = new Set(previos);
      if (!nuevos.delete(id)) nuevos.add(id);
      return nuevos;
    });

  const validar = (): boolean => {
    const nuevos: Errores<Campo> = {
      asunto: validarRequerido(asunto, 'Escribí el asunto: es lo primero que se lee en la bandeja.'),
      titulo: validarRequerido(titulo, 'Poné un título para el mail.'),
      mensaje: validarRequerido(mensaje, 'Escribí el mensaje.')
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(formulario.current);
      return false;
    }
    return true;
  };

  /** El mail tal como sale: las fotos del sitio van embebidas para que se vean en cualquier bandeja. */
  const mailFinal = async () => {
    let fotoUrl = vistaFoto;
    if (fotoUrl) {
      const absoluta = new URL(fotoUrl, window.location.href);
      if (absoluta.protocol === 'data:' || absoluta.origin === window.location.origin) fotoUrl = await fotoEmbebida(absoluta.href);
    }
    return armarMail(datos(fotoUrl), local);
  };

  const mandarPrueba = async () => {
    const error = validarEmail(casillaPrueba);
    setErrorPrueba(error);
    if (!validar() || error) return;
    setEnviando('prueba');
    try {
      const mail = await mailFinal();
      await enviarDifusion({ asunto: asunto.trim(), ...mail, prueba: casillaPrueba.trim() });
      toast.success(`Mandamos la prueba a ${casillaPrueba.trim()}.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(null);
    }
  };

  const mandarATodos = async () => {
    if (!validar()) return;
    const ok = await confirmar({
      titulo: `¿Mandar el mail a ${plural(destinatarios.length, 'cliente')}?`,
      texto: `Sale ahora con el asunto "${asunto.trim()}". Una vez enviado no se puede deshacer.`
    });
    if (!ok) return;
    setEnviando('todos');
    try {
      const mail = await mailFinal();
      const envio = await enviarDifusion({ asunto: asunto.trim(), ...mail, usuarioIds: destinatarios });
      if (envio.fallidos.length) {
        toast.error(`Salieron ${envio.enviados} y ${plural(envio.fallidos.length, 'dirección rebotó', 'direcciones rebotaron')}.`);
      } else {
        toast.success(`Listo: el mail salió a ${plural(envio.enviados, 'cliente')}.`);
      }
      estado.recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(null);
    }
  };

  const configurado = estado.data?.configurado ?? false;
  const envios = estado.data?.envios ?? [];

  return (
    <>
      <PageHeader title="Mails a clientes" lead="Armá la novedad o la promo, mirala como la va a ver el cliente y mandala." compact />

      <div className="wrap page">
        <div>
          {estado.data && !configurado && (
            <Notice tono="info">
              <div>
                <strong>Falta conectar la casilla de correo.</strong> Podés armar el mail y verlo, pero todavía no sale. Copiá <code>backend/.env.example</code> como{' '}
                <code>backend/.env</code>, completá la casilla y su contraseña de aplicación, y reiniciá el servidor.
              </div>
            </Notice>
          )}

          <div className="mailing">
            <div className="mailing__armado" ref={formulario}>
              <h2 className="mailing__paso">
                <span aria-hidden="true">1</span> El mensaje
              </h2>

              {platos.data && platos.data.length > 0 && (
                <SelectField
                  label="Traer un plato de la carta"
                  hint="Completa el título, la foto y la descripción con los del plato."
                  value=""
                  onChange={(e) => traerPlato(e.target.value)}
                  options={[{ value: '', label: 'Elegir plato…' }, ...platos.data.map((p) => ({ value: String(p.id), label: p.nombre }))]}
                />
              )}

              <TextField
                label="Asunto"
                hint="Lo que se lee en la bandeja de entrada, antes de abrir."
                maxLength={120}
                value={asunto}
                error={errores.asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
              <TextField label="Título" maxLength={60} value={titulo} error={errores.titulo} onChange={(e) => setTitulo(e.target.value)} />
              <TextAreaField
                label="Mensaje"
                hint="Dejá una línea en blanco para separar párrafos."
                rows={6}
                maxLength={900}
                value={mensaje}
                error={errores.mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />

              <div className="form-row">
                <TextField label="Promo destacada (opcional)" hint="Sale en grande, en rojo." maxLength={40} value={oferta} onChange={(e) => setOferta(e.target.value)} />
                <TextField label="Hasta cuándo vale (opcional)" maxLength={60} value={vigencia} onChange={(e) => setVigencia(e.target.value)} />
              </div>

              <SelectField
                label="Botón del mail"
                hint={boton ? (window.location.protocol.startsWith('http') ? `Lleva a ${enlaceDelSitio(boton)}` : 'Lleva a esa pantalla del sitio.') : 'El mail sale sin botón.'}
                value={boton}
                onChange={(e) => setBoton(e.target.value)}
                options={BOTONES}
              />

              <FotoPicker label="Foto" value={foto} onChange={setFoto} />
            </div>

            <div className="mailing__vista">
              <div className="mailing__vista-cabeza">
                <h2 className="mailing__paso mailing__paso--suelto">Así le llega</h2>
                <Toggle
                  legend="Ancho de la vista previa"
                  value={ancho}
                  onChange={setAncho}
                  options={[
                    { value: 'compu', label: 'Compu' },
                    { value: 'celu', label: 'Celular' }
                  ]}
                />
              </div>

              <div className="bandeja">
                <dl className="bandeja__datos">
                  <div>
                    <dt>De</dt>
                    <dd>{estado.data?.remitente || 'Pepe Di Roma'}</dd>
                  </div>
                  <div>
                    <dt>Asunto</dt>
                    <dd data-vacio={!asunto.trim() || undefined}>{asunto.trim() || 'Sin asunto todavía'}</dd>
                  </div>
                </dl>
                <div className="bandeja__marco" data-ancho={ancho}>
                  <iframe title="Vista previa del mail" sandbox="" srcDoc={previa} />
                </div>
              </div>
            </div>
          </div>

          <div className="mailing__envio">
            <div>
              <h2 className="mailing__paso">
                <span aria-hidden="true">2</span> A quién
              </h2>

              {usuarios.loading ? (
                <SkeletonList rows={2} height={44} />
              ) : clientes.length === 0 ? (
                <p className="empty-inline">Todavía no hay clientes registrados a quienes escribirles.</p>
              ) : (
                <>
                  <Toggle
                    legend="Destinatarios"
                    value={destino}
                    onChange={setDestino}
                    options={[
                      { value: 'todos', label: `Todos los clientes (${clientes.length})` },
                      { value: 'elegir', label: 'Elegir' }
                    ]}
                  />

                  {destino === 'elegir' && (
                    <div className="mailing__lista">
                      {clientes.length > 8 && (
                        <TextField label="Buscar por mail" type="search" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                      )}
                      <div className="mailing__atajos">
                        <Button variant="ghost" size="sm" onClick={() => setElegidos(new Set(clientes.map((c) => c.id)))}>
                          Marcar todos
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setElegidos(new Set())}>
                          Ninguno
                        </Button>
                      </div>
                      <ul>
                        {filtrados.map((c) => (
                          <li key={c.id}>
                            <Check label={c.email} checked={elegidos.has(c.id)} onChange={() => alternar(c.id)} />
                          </li>
                        ))}
                      </ul>
                      {filtrados.length === 0 && <p className="muted">Ningún cliente coincide con la búsqueda.</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <h2 className="mailing__paso">
                <span aria-hidden="true">3</span> Enviar
              </h2>

              <div className="mailing__prueba">
                <TextField
                  label="Probalo primero en tu casilla"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={casillaPrueba}
                  error={errorPrueba}
                  onChange={(e) => setCasillaPrueba(e.target.value)}
                />
                <Button variant="secondary" onClick={mandarPrueba} loading={enviando === 'prueba'} disabled={!configurado || enviando !== null}>
                  Enviarme una prueba
                </Button>
              </div>

              <Button block onClick={mandarATodos} loading={enviando === 'todos'} disabled={!configurado || enviando !== null || destinatarios.length === 0}>
                {destinatarios.length ? `Enviar a ${plural(destinatarios.length, 'cliente')}` : 'Elegí a quién enviarlo'}
              </Button>
              <p className="mailing__nota">Cada cliente recibe su propio mail: nadie ve las direcciones de los demás.</p>
            </div>
          </div>

          {envios.length > 0 && (
            <div className="mailing__historial">
              <h2 className="mailing__paso mailing__paso--suelto">Últimos envíos</h2>
              <ul>
                {envios.map((e) => (
                  <li key={e.id}>
                    <strong>{e.asunto}</strong>
                    <span>{formatearFechaHora(e.fecha)}</span>
                    <span>
                      {plural(e.enviados, 'enviado')}
                      {e.fallidos.length > 0 && ` · ${plural(e.fallidos.length, 'rebotado')}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
