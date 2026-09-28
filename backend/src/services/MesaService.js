const MesaRepository = require('../repositories/MesaRepository');
const ReservaRepository = require('../repositories/ReservaRepository');
const Messages = require('../enums/Messages');
const EstadoReserva = require('../enums/EstadoReserva');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

const ESTADOS_ACTIVOS = [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA];

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarNumero(numero) {
    const valor = Number(numero);
    if (!Number.isInteger(valor) || valor <= 0) {
        throw new BadRequestError(Messages.MESA_NUMERO_INVALID);
    }
    return valor;
}

function validarCapacidad(capacidad) {
    const valor = Number(capacidad);
    if (!Number.isInteger(valor) || valor <= 0) {
        throw new BadRequestError(Messages.MESA_CAPACIDAD_INVALID);
    }
    return valor;
}

function validarPosicion(posicion) {
    if (typeof posicion !== 'number' || !Number.isFinite(posicion)) {
        throw new BadRequestError(Messages.MESA_POSICION_INVALID);
    }
    return posicion;
}

function validarNumeroDisponible(numero, idAExcluir = null) {
    const existente = MesaRepository.findByNumero(numero);
    if (existente && existente.id !== idAExcluir) {
        throw new ConflictError(Messages.MESA_DUPLICATED);
    }
}

function reservasActivas(mesaId) {
    return ReservaRepository.findByMesaId(mesaId).filter((reserva) =>
        ESTADOS_ACTIVOS.includes(reserva.estado)
    );
}

function obtenerTodas() {
    return MesaRepository.findAll();
}

function obtenerPorId(id) {
    const mesaId = parsearId(id);
    const mesa = MesaRepository.findById(mesaId);

    if (!mesa) {
        throw new NotFoundError(Messages.MESA_NOT_FOUND);
    }

    return mesa;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const numero = validarNumero(body.numero);
    const capacidad = validarCapacidad(body.capacidad);
    const posicionX = body.posicionX === undefined ? 0 : validarPosicion(body.posicionX);
    const posicionY = body.posicionY === undefined ? 0 : validarPosicion(body.posicionY);

    validarNumeroDisponible(numero);

    return MesaRepository.create({ numero, capacidad, posicionX, posicionY });
}

function modificar(id, body) {
    const mesa = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.numero !== undefined) {
        cambios.numero = validarNumero(body.numero);
        validarNumeroDisponible(cambios.numero, mesa.id);
    }
    if (body.capacidad !== undefined) {
        cambios.capacidad = validarCapacidad(body.capacidad);

        const excedida = reservasActivas(mesa.id).some(
            (reserva) => reserva.cantidadIntegrantes > cambios.capacidad
        );
        if (excedida) {
            throw new ConflictError(Messages.MESA_CAPACIDAD_INSUFICIENTE);
        }
    }
    if (body.posicionX !== undefined) {
        cambios.posicionX = validarPosicion(body.posicionX);
    }
    if (body.posicionY !== undefined) {
        cambios.posicionY = validarPosicion(body.posicionY);
    }

    return MesaRepository.update(mesa.id, cambios);
}

function eliminar(id) {
    const mesa = obtenerPorId(id);

    if (reservasActivas(mesa.id).length > 0) {
        throw new ConflictError(Messages.MESA_CON_RESERVAS);
    }

    return MesaRepository.remove(mesa.id);
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
