const EnvioRepository = require('../repositories/EnvioRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const correo = require('../utils/correo');
const { AppError, BadRequestError } = require('../exceptions/AppError');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ASUNTO_MAX = 120;

function obtenerEstado() {
    return {
        configurado: correo.estaConfigurado(),
        remitente: correo.remitente(),
        envios: EnvioRepository.findAll().slice().reverse()
    };
}

function validarTexto(valor, mensaje) {
    if (typeof valor !== 'string' || valor.trim() === '') {
        throw new BadRequestError(mensaje);
    }
    return valor.trim();
}

/** Las direcciones salen de las cuentas del sistema: no se le escribe a quien no se registró. */
function resolverDestinatarios(usuarioIds) {
    if (!Array.isArray(usuarioIds) || usuarioIds.length === 0) {
        throw new BadRequestError(Messages.DIFUSION_DESTINATARIOS_REQUIRED);
    }

    const direcciones = new Set();
    for (const id of usuarioIds) {
        const usuario = UsuarioRepository.findById(Number(id));
        if (!usuario) {
            throw new BadRequestError(Messages.DIFUSION_DESTINATARIO_INVALID);
        }
        direcciones.add(usuario.email);
    }
    return [...direcciones];
}

async function enviar(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const asunto = validarTexto(body.asunto, Messages.DIFUSION_ASUNTO_REQUIRED);
    if (asunto.length > ASUNTO_MAX) {
        throw new BadRequestError(Messages.DIFUSION_ASUNTO_REQUIRED);
    }
    const html = validarTexto(body.html, Messages.DIFUSION_CUERPO_REQUIRED);
    const texto = validarTexto(body.texto, Messages.DIFUSION_CUERPO_REQUIRED);

    // la prueba va a una sola casilla y no queda en el registro
    const esPrueba = body.prueba !== undefined && body.prueba !== null;
    let destinatarios;
    if (esPrueba) {
        if (typeof body.prueba !== 'string' || !EMAIL.test(body.prueba.trim())) {
            throw new BadRequestError(Messages.DIFUSION_PRUEBA_INVALID);
        }
        destinatarios = [body.prueba.trim()];
    } else {
        destinatarios = resolverDestinatarios(body.usuarioIds);
    }

    if (!correo.estaConfigurado()) {
        throw new AppError(Messages.DIFUSION_SIN_CONFIGURAR, 503);
    }

    try {
        await correo.verificar();
    } catch (error) {
        console.error('[CORREO] No se pudo conectar con el servidor de correo:', error.message);
        throw new AppError(Messages.DIFUSION_SIN_CONEXION, 502);
    }

    const fallidos = [];
    for (const para of destinatarios) {
        try {
            await correo.enviar({ para, asunto: esPrueba ? `[Prueba] ${asunto}` : asunto, html, texto });
        } catch (error) {
            console.error(`[CORREO] No se pudo enviar a ${para}:`, error.message);
            fallidos.push(para);
        }
    }

    const resultado = {
        asunto,
        fecha: new Date().toISOString(),
        enviados: destinatarios.length - fallidos.length,
        fallidos
    };

    if (esPrueba) {
        if (fallidos.length > 0) {
            throw new AppError(Messages.DIFUSION_SIN_CONEXION, 502);
        }
        return { id: null, ...resultado };
    }

    return EnvioRepository.create(resultado);
}

module.exports = {
    obtenerEstado,
    enviar
};
