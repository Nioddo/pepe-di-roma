const PlatoRepository = require('../repositories/PlatoRepository');
const SeccionRepository = require('../repositories/SeccionRepository');
const Messages = require('../enums/Messages');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

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

function validarTextoOpcional(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }
    if (typeof valor !== 'string') {
        throw new BadRequestError(Messages.PLATO_TEXTO_INVALID);
    }
    return valor.trim() || null;
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
    const imageUrl = body.imageUrl === undefined || body.imageUrl === null ? null : validarImageUrl(body.imageUrl);
    const descripcion = validarTextoOpcional(body.descripcion);
    const medida = validarTextoOpcional(body.medida);
    const picante = body.picante === undefined ? false : validarFlag(body.picante);
    const destacado = body.destacado === undefined ? false : validarFlag(body.destacado);

    return PlatoRepository.create({ nombre, precio, vegano, sinTacc, imageUrl, descripcion, medida, picante, destacado });
}

function modificar(id, body) {
    const plato = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.nombre !== undefined) {
        cambios.nombre = validarNombre(body.nombre);
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
    if (body.descripcion !== undefined) {
        cambios.descripcion = validarTextoOpcional(body.descripcion);
    }
    if (body.medida !== undefined) {
        cambios.medida = validarTextoOpcional(body.medida);
    }
    if (body.picante !== undefined) {
        cambios.picante = validarFlag(body.picante);
    }
    if (body.destacado !== undefined) {
        cambios.destacado = validarFlag(body.destacado);
    }

    return PlatoRepository.update(plato.id, cambios);
}

function eliminar(id) {
    const plato = obtenerPorId(id);

    if (SeccionRepository.findByPlatoId(plato.id).length > 0) {
        throw new ConflictError(Messages.PLATO_EN_SECCION);
    }

    return PlatoRepository.remove(plato.id);
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
