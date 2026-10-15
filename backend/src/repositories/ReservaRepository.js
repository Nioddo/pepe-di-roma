const Reserva = require('../models/Reserva');
const EstadoReserva = require('../enums/EstadoReserva');
const { createIdGenerator } = require('../utils/idGenerator');
const historial = require('../data/historialSeed');

const reservas = [
    new Reserva(1, 1, '2026-10-24', '21:00', 2, 1, EstadoReserva.CONFIRMADA, 'Cliente de prueba', '+54 9 11 5000-1234'),
    new Reserva(2, 2, '2026-10-24', '21:00', 4, 2, EstadoReserva.PENDIENTE, 'Martín Pérez', '+54 9 11 6021-7788'),
    new Reserva(3, 1, '2026-10-31', '20:30', 8, null, EstadoReserva.PENDIENTE, 'Cliente de prueba', '+54 9 11 5000-1234'),
    ...historial.reservas.map(
        (r) => new Reserva(r.id, r.clienteId, r.fecha, r.horaInicio, r.cantidadIntegrantes, r.mesaId, r.estado, r.nombre, r.telefono)
    )
];

const nextId = createIdGenerator(Math.max(...reservas.map((r) => r.id)) + 1);

function findAll() {
    return reservas;
}

function findById(id) {
    return reservas.find((reserva) => reserva.id === id) || null;
}

function findByMesaAndFecha(mesaId, fecha) {
    return reservas.filter((reserva) => reserva.mesaId === mesaId && reserva.fecha === fecha);
}

function findByMesaId(mesaId) {
    return reservas.filter((reserva) => reserva.mesaId === mesaId);
}

function findByClienteId(clienteId) {
    return reservas.filter((reserva) => reserva.clienteId === clienteId);
}

function create(datos) {
    const reserva = new Reserva(
        nextId(),
        datos.clienteId,
        datos.fecha,
        datos.horaInicio,
        datos.cantidadIntegrantes,
        datos.mesaId,
        datos.estado,
        datos.nombre,
        datos.telefono
    );

    reservas.push(reserva);
    return reserva;
}

function update(id, datos) {
    const reserva = findById(id);
    if (!reserva) {
        return null;
    }

    Object.assign(reserva, datos);
    return reserva;
}

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
    findByMesaId,
    findByClienteId,
    create,
    update,
    remove
};
