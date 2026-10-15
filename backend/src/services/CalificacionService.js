const CalificacionRepository = require('../repositories/CalificacionRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const PlatoRepository = require('../repositories/PlatoRepository');
const Messages = require('../enums/Messages');
const { BadRequestError, NotFoundError } = require('../exceptions/AppError');

const PUNTAJE_MINIMO = 1;
const PUNTAJE_MAXIMO = 5;
const LARGO_MAXIMO_MENSAJE = 500;
const LARGO_MAXIMO_FIRMA = 40;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarUsuario(usuarioId) {
    if (usuarioId === undefined || usuarioId === null) {
        return null;
    }

    const id = parsearId(usuarioId);
    if (!UsuarioRepository.findById(id)) {
        throw new NotFoundError(Messages.USUARIO_NOT_FOUND);
    }
    return id;
}

function validarPlato(platoId) {
    if (platoId === undefined || platoId === null) {
        return null;
    }

    const id = parsearId(platoId);
    if (!PlatoRepository.findById(id)) {
        throw new NotFoundError(Messages.PLATO_NOT_FOUND);
    }
    return id;
}

function validarPuntaje(puntaje) {
    const valor = Number(puntaje);
    if (!Number.isInteger(valor) || valor < PUNTAJE_MINIMO || valor > PUNTAJE_MAXIMO) {
        throw new BadRequestError(Messages.CALIFICACION_PUNTAJE_INVALID);
    }
    return valor;
}

function validarAspecto(valor) {
    if (valor === undefined || valor === null) {
        return null;
    }
    return validarPuntaje(valor);
}

function validarMozo(mozo) {
    if (mozo === undefined || mozo === null || mozo === '') {
        return null;
    }
    if (typeof mozo !== 'string' || mozo.trim().length > LARGO_MAXIMO_FIRMA) {
        throw new BadRequestError(Messages.CALIFICACION_MOZO_INVALID);
    }
    return mozo.trim() || null;
}

function validarMensaje(mensaje) {
    if (typeof mensaje !== 'string' || mensaje.trim() === '') {
        throw new BadRequestError(Messages.CALIFICACION_MENSAJE_REQUIRED);
    }

    const limpio = mensaje.trim();
    if (limpio.length > LARGO_MAXIMO_MENSAJE) {
        throw new BadRequestError(Messages.CALIFICACION_MENSAJE_LARGO);
    }
    return limpio;
}

function validarFirma(firma) {
    if (typeof firma !== 'string' || firma.trim() === '' || firma.trim().length > LARGO_MAXIMO_FIRMA) {
        throw new BadRequestError(Messages.CALIFICACION_FIRMA_INVALID);
    }
    return firma.trim();
}

function validarFecha(fecha) {
    if (typeof fecha !== 'string' || !FORMATO_FECHA.test(fecha) || Number.isNaN(Date.parse(fecha))) {
        throw new BadRequestError(Messages.CALIFICACION_FECHA_INVALID);
    }
    return fecha;
}

function validarVisible(visible) {
    if (typeof visible !== 'boolean') {
        throw new BadRequestError(Messages.CALIFICACION_VISIBLE_INVALID);
    }
    return visible;
}

function validarRespuesta(respuesta) {
    if (respuesta === undefined || respuesta === null) {
        return null;
    }
    if (typeof respuesta !== 'string') {
        throw new BadRequestError(Messages.CALIFICACION_RESPUESTA_INVALID);
    }

    const limpia = respuesta.trim();
    if (limpia.length > LARGO_MAXIMO_MENSAJE) {
        throw new BadRequestError(Messages.CALIFICACION_RESPUESTA_INVALID);
    }
    return limpia === '' ? null : limpia;
}

function hoy() {
    return new Date().toISOString().slice(0, 10);
}

function obtenerTodas() {
    return CalificacionRepository.findAll();
}

function obtenerPorId(id) {
    const calificacionId = parsearId(id);
    const calificacion = CalificacionRepository.findById(calificacionId);

    if (!calificacion) {
        throw new NotFoundError(Messages.CALIFICACION_NOT_FOUND);
    }

    return calificacion;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const usuarioId = validarUsuario(body.usuarioId);
    const firma = validarFirma(body.firma);
    const puntaje = validarPuntaje(body.puntaje);
    const mensaje = validarMensaje(body.mensaje);
    const platoId = validarPlato(body.platoId);
    const fecha = body.fecha === undefined ? hoy() : validarFecha(body.fecha);
    const visible = body.visible === undefined ? true : validarVisible(body.visible);
    const respuesta = validarRespuesta(body.respuesta);
    const atencion = validarAspecto(body.atencion);
    const comida = validarAspecto(body.comida);
    const espacio = validarAspecto(body.espacio);
    const mozo = validarMozo(body.mozo);

    return CalificacionRepository.create({ usuarioId, firma, puntaje, mensaje, fecha, platoId, visible, respuesta, atencion, comida, espacio, mozo });
}

function modificar(id, body) {
    const calificacion = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.firma !== undefined) {
        cambios.firma = validarFirma(body.firma);
    }
    if (body.puntaje !== undefined) {
        cambios.puntaje = validarPuntaje(body.puntaje);
    }
    if (body.mensaje !== undefined) {
        cambios.mensaje = validarMensaje(body.mensaje);
    }
    if (body.platoId !== undefined) {
        cambios.platoId = validarPlato(body.platoId);
    }
    if (body.fecha !== undefined) {
        cambios.fecha = validarFecha(body.fecha);
    }
    if (body.visible !== undefined) {
        cambios.visible = validarVisible(body.visible);
    }
    if (body.respuesta !== undefined) {
        cambios.respuesta = validarRespuesta(body.respuesta);
    }
    for (const aspecto of ['atencion', 'comida', 'espacio']) {
        if (body[aspecto] !== undefined) {
            cambios[aspecto] = validarAspecto(body[aspecto]);
        }
    }
    if (body.mozo !== undefined) {
        cambios.mozo = validarMozo(body.mozo);
    }

    return CalificacionRepository.update(calificacion.id, cambios);
}

function eliminar(id) {
    const calificacion = obtenerPorId(id);
    return CalificacionRepository.remove(calificacion.id);
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
