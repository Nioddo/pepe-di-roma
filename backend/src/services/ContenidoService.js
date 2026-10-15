const ContenidoRepository = require('../repositories/ContenidoRepository');
const Messages = require('../enums/Messages');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarClave(clave) {
    if (typeof clave !== 'string' || clave.trim() === '') {
        throw new BadRequestError(Messages.CONTENIDO_CLAVE_REQUIRED);
    }
    return clave.trim();
}

function validarValor(valor) {
    if (typeof valor !== 'string') {
        throw new BadRequestError(Messages.CONTENIDO_VALOR_INVALID);
    }
    return valor;
}

function validarClaveDisponible(clave, idAExcluir = null) {
    const existente = ContenidoRepository.findByClave(clave);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.CONTENIDO_DUPLICATED);
    }
}

function obtenerTodos() {
    return ContenidoRepository.findAll();
}

function obtenerPorId(id) {
    const contenidoId = parsearId(id);
    const contenido = ContenidoRepository.findById(contenidoId);

    if (!contenido) {
        throw new NotFoundError(Messages.CONTENIDO_NOT_FOUND);
    }

    return contenido;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const clave = validarClave(body.clave);
    const valor = validarValor(body.valor);

    validarClaveDisponible(clave);

    return ContenidoRepository.create({ clave, valor });
}

function modificar(id, body) {
    const contenido = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.clave !== undefined) {
        cambios.clave = validarClave(body.clave);
        validarClaveDisponible(cambios.clave, contenido.id);
    }
    if (body.valor !== undefined) {
        cambios.valor = validarValor(body.valor);
    }

    return ContenidoRepository.update(contenido.id, cambios);
}

function eliminar(id) {
    const contenido = obtenerPorId(id);
    return ContenidoRepository.remove(contenido.id);
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
