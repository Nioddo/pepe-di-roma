const Reserva = require('../models/Reserva');
const EstadoReserva = require('../enums/EstadoReserva');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de Reservas.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

const reservas = [
    new Reserva(1, 10, '2026-09-20', '21:00', 2, 1, EstadoReserva.CONFIRMADA),
    new Reserva(2, 11, '2026-09-20', '22:00', 4, 2, EstadoReserva.PENDIENTE),
    new Reserva(3, 12, '2026-09-21', '20:30', 6, 3, EstadoReserva.PENDIENTE)
];

const nextId = createIdGenerator(reservas.length + 1);

function findAll() {
    return reservas;
}

function findById(id) {
    return reservas.find((reserva) => reserva.id === id) || null;
}

/** Reservas de una mesa en una fecha dada. La usa el service para ver solapamientos. */
function findByMesaAndFecha(mesaId, fecha) {
    return reservas.filter((reserva) => reserva.mesaId === mesaId && reserva.fecha === fecha);
}

function create(datos) {
    const reserva = new Reserva(
        nextId(),
        datos.clienteId,
        datos.fecha,
        datos.horaInicio,
        datos.cantidadIntegrantes,
        datos.mesaId,
        datos.estado
    );

    reservas.push(reserva);
    return reserva;
}

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {Reserva|null} la reserva actualizada, o null si no existe
 */
function update(id, datos) {
    const reserva = findById(id);
    if (!reserva) {
        return null;
    }

    Object.assign(reserva, datos);
    return reserva;
}

/**
 * @returns {Reserva|null} la reserva eliminada, o null si no existe
 */
function remove(id) {
    const indice = reservas.findIndex((reserva) => reserva.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminada] = reservas.splice(indice, 1);
    return eliminada;
}

module.exports = {
    findAll,
    findById,
    findByMesaAndFecha,
    create,
    update,
    remove
};
