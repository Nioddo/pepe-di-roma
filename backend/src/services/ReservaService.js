const ReservaRepository = require('../repositories/ReservaRepository');
const MesaRepository = require('../repositories/MesaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const EstadoReserva = require('../enums/EstadoReserva');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

/**
 * Logica de negocio de Reservas.
 * Reglas que hace cumplir:
 *  - el cliente tiene que existir,
 *  - la mesa tiene que existir y entrar la cantidad de integrantes,
 *  - no se puede pisar otra reserva de la misma mesa en el mismo horario.
 */

/** Duracion fija de una reserva, igual a la que fija el modelo Reserva. */
const DURACION_MIN = 120;

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarClienteId(clienteId) {
    const numero = Number(clienteId);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.RESERVA_CLIENTE_REQUIRED);
    }

    if (!UsuarioRepository.findById(numero)) {
        throw new NotFoundError(Messages.USUARIO_NOT_FOUND);
    }

    return numero;
}

/** Valida formato YYYY-MM-DD y que sea una fecha real del calendario. */
function validarFecha(fecha) {
    if (typeof fecha !== 'string' || !FORMATO_FECHA.test(fecha)) {
        throw new BadRequestError(Messages.RESERVA_FECHA_INVALID);
    }

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const parseada = new Date(Date.UTC(anio, mes - 1, dia));

    const esFechaReal =
        parseada.getUTCFullYear() === anio &&
        parseada.getUTCMonth() === mes - 1 &&
        parseada.getUTCDate() === dia;

    if (!esFechaReal) {
        throw new BadRequestError(Messages.RESERVA_FECHA_INVALID);
    }

    return fecha;
}

function validarHora(horaInicio) {
    if (typeof horaInicio !== 'string' || !FORMATO_HORA.test(horaInicio)) {
        throw new BadRequestError(Messages.RESERVA_HORA_INVALID);
    }
    return horaInicio;
}

function validarIntegrantes(cantidad) {
    const numero = Number(cantidad);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.RESERVA_INTEGRANTES_INVALID);
    }
    return numero;
}

function validarEstado(estado) {
    if (!Object.values(EstadoReserva).includes(estado)) {
        throw new BadRequestError(Messages.RESERVA_ESTADO_INVALID);
    }
    return estado;
}

/** La mesa debe existir; se devuelve para poder chequear su capacidad. */
function obtenerMesa(mesaId) {
    const numero = Number(mesaId);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.MESA_NOT_FOUND);
    }

    const mesa = MesaRepository.findById(numero);
    if (!mesa) {
        throw new NotFoundError(Messages.MESA_NOT_FOUND);
    }

    return mesa;
}

/** "21:30" -> 1290 minutos, para poder comparar intervalos. */
function aMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

/**
 * Corta si la mesa ya esta tomada en ese rango horario.
 * Las reservas canceladas no ocupan la mesa. Al modificar, la propia reserva
 * se excluye de la comparacion.
 */
function validarDisponibilidad({ mesaId, fecha, horaInicio, idAExcluir = null }) {
    const inicio = aMinutos(horaInicio);
    const fin = inicio + DURACION_MIN;

    const seSolapa = ReservaRepository.findByMesaAndFecha(mesaId, fecha).some((reserva) => {
        if (reserva.id === idAExcluir || reserva.estado === EstadoReserva.CANCELADA) {
            return false;
        }

        const inicioExistente = aMinutos(reserva.horaInicio);
        const finExistente = inicioExistente + (reserva.duracionMin || DURACION_MIN);

        return inicio < finExistente && inicioExistente < fin;
    });

    if (seSolapa) {
        throw new ConflictError(Messages.RESERVA_MESA_OCUPADA);
    }
}

function obtenerTodas() {
    return ReservaRepository.findAll();
}

function obtenerPorId(id) {
    const reservaId = parsearId(id);
    const reserva = ReservaRepository.findById(reservaId);

    if (!reserva) {
        throw new NotFoundError(Messages.RESERVA_NOT_FOUND);
    }

    return reserva;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const clienteId = validarClienteId(body.clienteId);
    const fecha = validarFecha(body.fecha);
    const horaInicio = validarHora(body.horaInicio);
    const cantidadIntegrantes = validarIntegrantes(body.cantidadIntegrantes);
    const mesa = obtenerMesa(body.mesaId);
    const estado = body.estado === undefined ? EstadoReserva.PENDIENTE : validarEstado(body.estado);

    if (mesa.capacidad < cantidadIntegrantes) {
        throw new ConflictError(Messages.MESA_CAPACIDAD_INSUFICIENTE);
    }

    validarDisponibilidad({ mesaId: mesa.id, fecha, horaInicio });

    return ReservaRepository.create({
        clienteId,
        fecha,
        horaInicio,
        cantidadIntegrantes,
        mesaId: mesa.id,
        estado
    });
}

/**
 * Modificacion parcial. Las reglas de capacidad y disponibilidad se revalidan
 * sobre el resultado de mezclar la reserva actual con los cambios pedidos.
 */
function modificar(id, body) {
    const reserva = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.clienteId !== undefined) {
        cambios.clienteId = validarClienteId(body.clienteId);
    }
    if (body.fecha !== undefined) {
        cambios.fecha = validarFecha(body.fecha);
    }
    if (body.horaInicio !== undefined) {
        cambios.horaInicio = validarHora(body.horaInicio);
    }
    if (body.cantidadIntegrantes !== undefined) {
        cambios.cantidadIntegrantes = validarIntegrantes(body.cantidadIntegrantes);
    }
    if (body.mesaId !== undefined) {
        cambios.mesaId = obtenerMesa(body.mesaId).id;
    }
    if (body.estado !== undefined) {
        cambios.estado = validarEstado(body.estado);
    }

    const resultado = Object.assign({}, reserva, cambios);
    const mesa = obtenerMesa(resultado.mesaId);

    if (mesa.capacidad < resultado.cantidadIntegrantes) {
        throw new ConflictError(Messages.MESA_CAPACIDAD_INSUFICIENTE);
    }

    if (resultado.estado !== EstadoReserva.CANCELADA) {
        validarDisponibilidad({
            mesaId: resultado.mesaId,
            fecha: resultado.fecha,
            horaInicio: resultado.horaInicio,
            idAExcluir: reserva.id
        });
    }

    return ReservaRepository.update(reserva.id, cambios);
}

function eliminar(id) {
    const reserva = obtenerPorId(id);
    return ReservaRepository.remove(reserva.id);
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
