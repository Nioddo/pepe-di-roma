const SeccionRepository = require('../repositories/SeccionRepository');
const PlatoRepository = require('../repositories/PlatoRepository');
const Messages = require('../enums/Messages');
const Carta = require('../enums/Carta');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarTitulo(titulo) {
    if (typeof titulo !== 'string' || titulo.trim() === '') {
        throw new BadRequestError(Messages.SECCION_TITULO_REQUIRED);
    }
    return titulo.trim();
}

function validarOrden(orden) {
    const numero = Number(orden);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.SECCION_ORDEN_INVALID);
    }
    return numero;
}

function validarPlatos(platos) {
    if (!Array.isArray(platos)) {
        throw new BadRequestError(Messages.SECCION_PLATOS_INVALID);
    }

    const ids = platos.map(Number);

    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new BadRequestError(Messages.SECCION_PLATOS_INVALID);
    }
    if (new Set(ids).size !== ids.length) {
        throw new BadRequestError(Messages.SECCION_PLATOS_INVALID);
    }
    if (ids.some((id) => !PlatoRepository.findById(id))) {
        throw new NotFoundError(Messages.PLATO_NOT_FOUND);
    }

    return ids;
}

function validarCarta(carta) {
    if (!Object.values(Carta).includes(carta)) {
        throw new BadRequestError(Messages.SECCION_CARTA_INVALID);
    }
    return carta;
}

function validarTextoOpcional(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }
    if (typeof valor !== 'string') {
        throw new BadRequestError(Messages.SECCION_TEXTO_INVALID);
    }
    return valor.trim() || null;
}

function validarTituloDisponible(titulo, carta, idAExcluir = null) {
    const existente = SeccionRepository.findByTitulo(titulo, carta);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.SECCION_DUPLICATED);
    }
}

function obtenerTodas() {
    return SeccionRepository.findAll();
}

function obtenerPorId(id) {
    const seccionId = parsearId(id);
    const seccion = SeccionRepository.findById(seccionId);

    if (!seccion) {
        throw new NotFoundError(Messages.SECCION_NOT_FOUND);
    }

    return seccion;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const titulo = validarTitulo(body.titulo);
    const orden = validarOrden(body.orden);
    const platos = body.platos === undefined ? [] : validarPlatos(body.platos);
    const carta = body.carta === undefined ? Carta.RISTORANTE : validarCarta(body.carta);
    const grupo = validarTextoOpcional(body.grupo);
    const subtitulo = validarTextoOpcional(body.subtitulo);
    const nota = validarTextoOpcional(body.nota);

    validarTituloDisponible(titulo, carta);

    return SeccionRepository.create({ titulo, orden, platos, carta, grupo, subtitulo, nota });
}

function modificar(id, body) {
    const seccion = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.carta !== undefined) {
        cambios.carta = validarCarta(body.carta);
    }
    if (body.titulo !== undefined || body.carta !== undefined) {
        cambios.titulo = body.titulo !== undefined ? validarTitulo(body.titulo) : seccion.titulo;
        validarTituloDisponible(cambios.titulo, cambios.carta || seccion.carta, seccion.id);
    }
    if (body.grupo !== undefined) {
        cambios.grupo = validarTextoOpcional(body.grupo);
    }
    if (body.subtitulo !== undefined) {
        cambios.subtitulo = validarTextoOpcional(body.subtitulo);
    }
    if (body.nota !== undefined) {
        cambios.nota = validarTextoOpcional(body.nota);
    }
    if (body.orden !== undefined) {
        cambios.orden = validarOrden(body.orden);
    }
    if (body.platos !== undefined) {
        cambios.platos = validarPlatos(body.platos);
    }

    return SeccionRepository.update(seccion.id, cambios);
}

function eliminar(id) {
    const seccion = obtenerPorId(id);
    return SeccionRepository.remove(seccion.id);
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
