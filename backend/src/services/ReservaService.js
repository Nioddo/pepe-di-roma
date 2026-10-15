const ReservaRepository = require('../repositories/ReservaRepository');
const MesaRepository = require('../repositories/MesaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const EstadoReserva = require('../enums/EstadoReserva');
const { telefonoValido } = require('../utils/telefono');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

const DURACION_MIN = 120;
const MAX_ELIGE_MESA = 4;
const MAX_ONLINE = 12;

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
    if (numero > MAX_ONLINE) {
        throw new BadRequestError(Messages.RESERVA_GRUPO_EXCEDIDO);
    }
    return numero;
}

function validarEstado(estado) {
    if (!Object.values(EstadoReserva).includes(estado)) {
        throw new BadRequestError(Messages.RESERVA_ESTADO_INVALID);
    }
    return estado;
}

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

function validarMesaSegunGrupo(mesaId, cantidadIntegrantes) {
    const sinMesa = mesaId === null || mesaId === undefined;

    if (cantidadIntegrantes <= MAX_ELIGE_MESA) {
        if (sinMesa) {
            throw new BadRequestError(Messages.RESERVA_MESA_REQUERIDA);
        }
        const mesa = obtenerMesa(mesaId);
        if (mesa.capacidad < cantidadIntegrantes) {
            throw new ConflictError(Messages.MESA_CAPACIDAD_INSUFICIENTE);
        }
        return mesa.id;
    }

    return sinMesa ? null : obtenerMesa(mesaId).id;
}

function aMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

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

function validarNombre(nombre) {
    if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 60) {
        throw new BadRequestError(Messages.RESERVA_NOMBRE_REQUIRED);
    }
    return nombre.trim();
}

function validarTelefonoReserva(telefono) {
    if (!telefonoValido(telefono)) {
        throw new BadRequestError(Messages.RESERVA_TELEFONO_INVALID);
    }
    return telefono.trim();
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const clienteId = validarClienteId(body.clienteId);
    const fecha = validarFecha(body.fecha);
    const horaInicio = validarHora(body.horaInicio);
    const cantidadIntegrantes = validarIntegrantes(body.cantidadIntegrantes);
    const mesaId = validarMesaSegunGrupo(body.mesaId, cantidadIntegrantes);
    const estado = body.estado === undefined ? EstadoReserva.PENDIENTE : validarEstado(body.estado);
    const nombre = validarNombre(body.nombre);
    const telefono = validarTelefonoReserva(body.telefono);

    if (mesaId !== null) {
        validarDisponibilidad({ mesaId, fecha, horaInicio });
    }

    return ReservaRepository.create({
        clienteId,
        fecha,
        horaInicio,
        cantidadIntegrantes,
        mesaId,
        estado,
        nombre,
        telefono
    });
}

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
        cambios.mesaId = body.mesaId;
    }
    if (body.estado !== undefined) {
        cambios.estado = validarEstado(body.estado);
    }
    if (body.nombre !== undefined) {
        cambios.nombre = validarNombre(body.nombre);
    }
    if (body.telefono !== undefined) {
        cambios.telefono = validarTelefonoReserva(body.telefono);
    }

    const resultado = Object.assign({}, reserva, cambios);
    resultado.mesaId = validarMesaSegunGrupo(resultado.mesaId, resultado.cantidadIntegrantes);
    if (cambios.mesaId !== undefined || cambios.cantidadIntegrantes !== undefined) {
        cambios.mesaId = resultado.mesaId;
    }

    if (resultado.estado !== EstadoReserva.CANCELADA && resultado.mesaId !== null) {
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
