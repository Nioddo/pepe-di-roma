const ReservaRepository = require('../repositories/ReservaRepository');
const MesaRepository = require('../repositories/MesaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const EstadoReserva = require('../enums/EstadoReserva');
const Rol = require('../enums/Rol');
const { telefonoValido } = require('../utils/telefono');
const { BadRequestError, NotFoundError, ConflictError, ForbiddenError } = require('../exceptions/AppError');

const DURACION_MIN = 120;
const MAX_ELIGE_MESA = 4;
const MAX_ONLINE = 12;
const APERTURA_MIN = 8 * 60 + 30;
const TURNO_MIN = 30;

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

function esPersonal(usuario) {
    return Boolean(usuario) && (usuario.rol === Rol.ADMIN || usuario.rol === Rol.EMPLEADO);
}

function ahoraLocal() {
    const d = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

// Turnos de 30 minutos desde las 8:30. El local cierra a las 00 h (viernes y sabados a la 1),
// y como la reserva dura 2 h, el ultimo turno empieza 2 h antes del cierre.
function validarTurno(fecha, horaInicio) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
    const cierre = diaSemana === 5 || diaSemana === 6 ? 25 * 60 : 24 * 60;
    const inicio = aMinutos(horaInicio);

    if (inicio < APERTURA_MIN || inicio > cierre - DURACION_MIN || (inicio - APERTURA_MIN) % TURNO_MIN !== 0) {
        throw new BadRequestError(Messages.RESERVA_FUERA_DE_HORARIO);
    }
    if (`${fecha} ${horaInicio}` < ahoraLocal()) {
        throw new BadRequestError(Messages.RESERVA_FECHA_PASADA);
    }
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

function ocultarDatosPersonales(reserva) {
    return { ...reserva, clienteId: null, nombre: null, telefono: null };
}

// El personal ve todo; el resto solo ve sus datos y, de las demas, lo necesario para saber que mesa esta ocupada.
function obtenerTodas(solicitante = null) {
    const reservas = ReservaRepository.findAll();
    if (esPersonal(solicitante)) {
        return reservas;
    }
    return reservas.map((reserva) =>
        solicitante && reserva.clienteId === solicitante.id ? reserva : ocultarDatosPersonales(reserva)
    );
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

function crear(body, solicitante = null) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const personal = esPersonal(solicitante);
    const clienteId = validarClienteId(body.clienteId);
    const fecha = validarFecha(body.fecha);
    const horaInicio = validarHora(body.horaInicio);
    validarTurno(fecha, horaInicio);
    const cantidadIntegrantes = validarIntegrantes(body.cantidadIntegrantes);
    const eligeMesa = body.mesaId !== null && body.mesaId !== undefined;
    if (!personal && cantidadIntegrantes > MAX_ELIGE_MESA && eligeMesa) {
        throw new BadRequestError(Messages.RESERVA_MESA_LA_ASIGNA_LOCAL);
    }
    const mesaId = validarMesaSegunGrupo(body.mesaId, cantidadIntegrantes);
    const estado = body.estado === undefined ? EstadoReserva.PENDIENTE : validarEstado(body.estado);
    if (!personal && estado !== EstadoReserva.PENDIENTE) {
        throw new ForbiddenError(Messages.RESERVA_ESTADO_SOLO_PERSONAL);
    }
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

function modificar(id, body, solicitante = null) {
    const reserva = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const personal = esPersonal(solicitante);
    const cambiaEstado = body.estado !== undefined && body.estado !== reserva.estado;
    if (!personal && cambiaEstado && body.estado !== EstadoReserva.CANCELADA) {
        throw new ForbiddenError(Messages.RESERVA_ESTADO_SOLO_PERSONAL);
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
    // las reservas viejas se pueden seguir editando (estado, mesa); solo se valida el turno si cambia
    if (resultado.fecha !== reserva.fecha || resultado.horaInicio !== reserva.horaInicio) {
        validarTurno(resultado.fecha, resultado.horaInicio);
    }
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
