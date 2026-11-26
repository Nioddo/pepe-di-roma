const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const { enviarMail, obtenerTransporte } = require('../utils/mailer');
const { BadRequestError, ServiceUnavailableError } = require('../exceptions/AppError');

const MAX_ASUNTO = 120;
const MAX_MENSAJE = 5000;
const TAMANO_LOTE = 10;

function textoValido(valor, max) {
    return typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= max;
}

function escapar(texto) {
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function opcional(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

function esLinkSeguro(valor) {
    try {
        return new URL(valor).protocol === 'https:';
    } catch {
        return false;
    }
}

function armarHtml({ titulo, mensaje, imagen, botonTexto, botonLink }) {
    const parrafos = mensaje
        .split(/\n{2,}/)
        .map((p) => `<p style="margin:0 0 14px;font-size:16px">${escapar(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
    const banner = imagen
        ? `<img src="${escapar(imagen).replace(/"/g, '&quot;')}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0">`
        : '';
    const encabezado = titulo
        ? `<h1 style="font-size:26px;line-height:1.2;margin:0 0 16px;color:#222">${escapar(titulo)}</h1>`
        : '';
    const boton = botonLink
        ? `<p style="margin:24px 0 0"><a href="${escapar(botonLink).replace(/"/g, '&quot;')}" style="display:inline-block;background:#CE1320;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px">${escapar(botonTexto)}</a></p>`
        : '';

    return `<div style="background:#FCE8E8;padding:24px 12px;font-family:Arial,sans-serif;color:#222;line-height:1.5">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
<div style="padding:20px 28px;font-size:26px;font-weight:bold;color:#CE1320">Pepe Di Roma</div>${banner}
<div style="padding:28px">${encabezado}${parrafos}${boton}</div>
<div style="padding:16px 28px;background:#fafafa;font-size:12px;color:#777">Recibis este mail porque tenes una cuenta en Pepe Di Roma.</div>
</div></div>`;
}

function obtenerDestinatarios() {
    const emails = UsuarioRepository.findAll().map((usuario) => usuario.email.toLowerCase());
    return [...new Set(emails)];
}

function contarDestinatarios() {
    return { total: obtenerDestinatarios().length };
}

async function enviar(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (!textoValido(body.asunto, MAX_ASUNTO)) {
        throw new BadRequestError(Messages.PROMOCION_ASUNTO_INVALID);
    }
    if (!textoValido(body.mensaje, MAX_MENSAJE)) {
        throw new BadRequestError(Messages.PROMOCION_MENSAJE_INVALID);
    }

    const titulo = opcional(body.titulo);
    const imagen = opcional(body.imagen);
    const botonTexto = opcional(body.botonTexto);
    const botonLink = opcional(body.botonLink);
    if (titulo.length > MAX_ASUNTO) {
        throw new BadRequestError(Messages.PROMOCION_TITULO_INVALID);
    }
    if (imagen && !esLinkSeguro(imagen)) {
        throw new BadRequestError(Messages.PROMOCION_IMAGEN_INVALID);
    }
    if ((botonTexto || botonLink) && (!botonTexto || botonTexto.length > 40 || !esLinkSeguro(botonLink))) {
        throw new BadRequestError(Messages.PROMOCION_BOTON_INVALID);
    }

    const destinatarios = obtenerDestinatarios();
    if (destinatarios.length === 0) {
        throw new BadRequestError(Messages.PROMOCION_SIN_DESTINATARIOS);
    }

    obtenerTransporte();

    const asunto = body.asunto.trim();
    const texto = body.mensaje.trim();
    const html = armarHtml({ titulo, mensaje: texto, imagen, botonTexto, botonLink });
    const fallidos = [];
    let enviados = 0;

    for (let i = 0; i < destinatarios.length; i += TAMANO_LOTE) {
        const lote = destinatarios.slice(i, i + TAMANO_LOTE);
        const resultados = await Promise.allSettled(
            lote.map((para) => enviarMail({ para, asunto, texto, html }))
        );
        resultados.forEach((resultado, indice) => {
            if (resultado.status === 'fulfilled') {
                enviados += 1;
            } else {
                fallidos.push(lote[indice]);
            }
        });
    }

    if (enviados === 0) {
        throw new ServiceUnavailableError(Messages.PROMOCION_ENVIO_FALLIDO);
    }

    return { total: destinatarios.length, enviados, fallidos };
}

module.exports = { contarDestinatarios, enviar };
