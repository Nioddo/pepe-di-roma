const PlatoRepository = require('../repositories/PlatoRepository');
const Messages = require('../enums/Messages');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

/**
 * Logica de negocio de Platos: valida las entradas y lanza AppError cuando
 * algo no cumple. Nunca toca el array directamente, siempre via repository.
 */

/** Convierte el id que llega por la URL en entero, o lanza 400. */
function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarNombre(nombre) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new BadRequestError(Messages.PLATO_NOMBRE_REQUIRED);
    }
    return nombre.trim();
}

function validarPrecio(precio) {
    if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
        throw new BadRequestError(Messages.PLATO_PRECIO_INVALID);
    }
    return precio;
}

function validarFlag(valor) {
    if (typeof valor !== 'boolean') {
        throw new BadRequestError(Messages.PLATO_FLAG_INVALID);
    }
    return valor;
}

function validarImageUrl(imageUrl) {
    if (typeof imageUrl !== 'string') {
        throw new BadRequestError(Messages.PLATO_IMAGE_INVALID);
    }
    return imageUrl;
}

/** Corta si ya hay otro plato con el mismo nombre. */
function validarNombreDisponible(nombre, idAExcluir = null) {
    const existente = PlatoRepository.findByNombre(nombre);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.PLATO_DUPLICATED);
    }
}

function obtenerTodos() {
    return PlatoRepository.findAll();
}

function obtenerPorId(id) {
    const platoId = parsearId(id);
    const plato = PlatoRepository.findById(platoId);

    if (!plato) {
        throw new NotFoundError(Messages.PLATO_NOT_FOUND);
    }

    return plato;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const nombre = validarNombre(body.nombre);
    const precio = validarPrecio(body.precio);
    const vegano = body.vegano === undefined ? false : validarFlag(body.vegano);
    const sinTacc = body.sinTacc === undefined ? false : validarFlag(body.sinTacc);
    const imageUrl = body.imageUrl === undefined ? null : validarImageUrl(body.imageUrl);

    validarNombreDisponible(nombre);

    return PlatoRepository.create({ nombre, precio, vegano, sinTacc, imageUrl });
}

/** Modificacion parcial: solo se valida y actualiza lo que viene en el body. */
function modificar(id, body) {
    const plato = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.nombre !== undefined) {
        cambios.nombre = validarNombre(body.nombre);
        validarNombreDisponible(cambios.nombre, plato.id);
    }
    if (body.precio !== undefined) {
        cambios.precio = validarPrecio(body.precio);
    }
    if (body.vegano !== undefined) {
        cambios.vegano = validarFlag(body.vegano);
    }
    if (body.sinTacc !== undefined) {
        cambios.sinTacc = validarFlag(body.sinTacc);
    }
    if (body.imageUrl !== undefined) {
        cambios.imageUrl = body.imageUrl === null ? null : validarImageUrl(body.imageUrl);
    }

    return PlatoRepository.update(plato.id, cambios);
}

function eliminar(id) {
    const plato = obtenerPorId(id);
    return PlatoRepository.remove(plato.id);
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
