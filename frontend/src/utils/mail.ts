// Arma el mail de difusión. La misma función dibuja la vista previa y lo que se manda,
// así lo que ve el admin es exactamente lo que le llega al cliente.
// Es HTML de correo: tablas y estilos en línea, porque los clientes de mail ignoran el CSS moderno.

export interface MailDatos {
  asunto: string;
  titulo: string;
  mensaje: string;
  /** URL de la foto (o data: al enviar). */
  foto: string | null;
  /** La promo en grande: "2×1 en pastas". */
  oferta: string;
  /** Hasta cuándo vale: "Hasta el domingo". */
  vigencia: string;
  botonTexto: string;
  botonUrl: string;
}

export interface MailLocal {
  lema: string;
  direccion: string;
  barrio: string;
  dias: string;
  horario: string;
  horarioExtendido: string;
  telefono: string;
  instagram: string;
  instagramUrl: string;
}

const ROJO = '#ce1320';
const ROSA = '#fce8e8';
const ROSA_FUERTE = '#f7d6d6';
const TINTA = '#1a1a1a';
const GRIS = '#5c5050';
const TITULAR = "Anton, Impact, 'Arial Narrow', Arial, sans-serif";
const TEXTO = "Poppins, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const parrafos = (s: string) =>
  s
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Lo que falta escribir se ve en gris en la vista previa (nunca en el mail que sale). */
const hueco = (texto: string) => `<span style="color:#b9a9a9;">${texto}</span>`;

export function armarMail(d: MailDatos, local: MailLocal, borrador = false): { html: string; texto: string } {
  const titulo = d.titulo.trim();
  const cuerpo = parrafos(d.mensaje);
  const oferta = d.oferta.trim();
  const vigencia = d.vigencia.trim();
  const conBoton = d.botonTexto.trim() !== '' && d.botonUrl.trim() !== '';

  const fila = (contenido: string, relleno: string, fondo = '#ffffff') =>
    `<tr><td style="padding:${relleno};background:${fondo};">${contenido}</td></tr>`;

  const filas: string[] = [];

  filas.push(
    fila(
      `<p style="margin:0;font-family:${TITULAR};font-size:26px;line-height:1;letter-spacing:.5px;text-transform:uppercase;color:${ROJO};">Pepe Di Roma</p>` +
        (local.lema ? `<p style="margin:6px 0 0;font-family:${TEXTO};font-size:13px;line-height:1.3;color:${GRIS};">${escapar(local.lema)}</p>` : ''),
      '28px 32px 22px'
    )
  );

  if (d.foto) {
    filas.push(
      `<tr><td style="padding:0;background:#ffffff;"><img src="${escapar(d.foto)}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>`
    );
  }

  if (titulo || borrador) {
    filas.push(
      fila(
        `<h1 style="margin:0;font-family:${TITULAR};font-size:40px;line-height:1.05;font-weight:400;text-transform:uppercase;color:${TINTA};">${titulo ? escapar(titulo) : hueco('El título va acá')}</h1>`,
        '30px 32px 0'
      )
    );
  }

  if (oferta) {
    filas.push(
      fila(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:20px 24px;background:${ROJO};border-radius:14px;">` +
          `<p style="margin:0;font-family:${TITULAR};font-size:34px;line-height:1.05;text-transform:uppercase;color:#ffffff;">${escapar(oferta)}</p>` +
          (vigencia ? `<p style="margin:8px 0 0;font-family:${TEXTO};font-size:14px;line-height:1.4;font-weight:600;color:#ffffff;">${escapar(vigencia)}</p>` : '') +
          `</td></tr></table>`,
        '22px 32px 0'
      )
    );
  }

  if (cuerpo.length || borrador) {
    const texto = cuerpo.length
      ? cuerpo
          .map((p) => `<p style="margin:0 0 14px;font-family:${TEXTO};font-size:16px;line-height:1.6;color:${TINTA};">${escapar(p).replace(/\n/g, '<br>')}</p>`)
          .join('')
      : `<p style="margin:0 0 14px;font-family:${TEXTO};font-size:16px;line-height:1.6;">${hueco('Acá va el mensaje: qué es, para quién y por qué vale la pena venir.')}</p>`;
    filas.push(fila(texto, '22px 32px 0'));
  }

  if (!oferta && vigencia) {
    filas.push(fila(`<p style="margin:0;font-family:${TEXTO};font-size:14px;line-height:1.4;font-weight:600;color:${ROJO};">${escapar(vigencia)}</p>`, '4px 32px 0'));
  }

  if (conBoton) {
    filas.push(
      fila(
        `<a href="${escapar(d.botonUrl.trim())}" style="display:inline-block;padding:15px 30px;border-radius:999px;background:${ROJO};font-family:${TEXTO};font-size:16px;line-height:1;font-weight:600;color:#ffffff;text-decoration:none;">${escapar(d.botonTexto.trim())}</a>`,
        '12px 32px 0'
      )
    );
  }

  filas.push(fila('&nbsp;', '0', '#ffffff').replace('padding:0;', 'padding:0;height:34px;font-size:0;line-height:0;'));

  const horario = [local.dias && local.horario ? `${local.dias}, ${local.horario}` : local.horario, local.horarioExtendido].filter(Boolean);
  const donde = [local.direccion, local.barrio].filter(Boolean).join(' · ');
  const pie = [
    donde && `<strong style="color:${TINTA};">${escapar(donde)}</strong>`,
    ...horario.map(escapar),
    local.telefono && escapar(local.telefono),
    local.instagram && (local.instagramUrl ? `<a href="${escapar(local.instagramUrl)}" style="color:${ROJO};font-weight:600;">${escapar(local.instagram)}</a>` : escapar(local.instagram))
  ].filter(Boolean);

  filas.push(
    fila(
      `<p style="margin:0;font-family:${TEXTO};font-size:13px;line-height:1.7;color:${GRIS};">${pie.join('<br>')}</p>` +
        `<p style="margin:16px 0 0;padding-top:14px;border-top:2px solid ${ROSA_FUERTE};font-family:${TEXTO};font-size:12px;line-height:1.5;color:${GRIS};">Te escribimos porque tenés una cuenta en Pepe Di Roma. Si preferís no recibir estos mails, respondé este mensaje y te sacamos de la lista.</p>`,
      '24px 32px 28px',
      ROSA
    )
  );

  const html =
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapar(d.asunto.trim())}</title></head>` +
    `<body style="margin:0;padding:0;background:${ROSA};">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ROSA};"><tr><td align="center" style="padding:24px 12px;">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;">` +
    filas.join('') +
    `</table></td></tr></table></body></html>`;

  const texto = [
    'PEPE DI ROMA',
    titulo.toUpperCase(),
    oferta && [oferta, vigencia].filter(Boolean).join(' — '),
    ...cuerpo,
    !oferta && vigencia,
    conBoton && `${d.botonTexto.trim()}: ${d.botonUrl.trim()}`,
    [donde, ...horario, local.telefono].filter(Boolean).join('\n'),
    'Te escribimos porque tenés una cuenta en Pepe Di Roma. Si preferís no recibir estos mails, respondé este mensaje.'
  ]
    .filter(Boolean)
    .join('\n\n');

  return { html, texto };
}

/** Las fotos del sitio viajan embebidas: el servidor de correo las adjunta al cuerpo. */
export async function fotoEmbebida(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error('No pudimos leer la foto elegida.');
  const blob = await respuesta.blob();
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(new Error('No pudimos leer la foto elegida.'));
    lector.readAsDataURL(blob);
  });
}
