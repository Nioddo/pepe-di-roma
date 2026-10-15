const Pedido = require('../models/Pedido');
const EstadoPedido = require('../enums/EstadoPedido');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const { createIdGenerator } = require('../utils/idGenerator');
const historial = require('../data/historialSeed');

const pedidos = [
    new Pedido(
        1,
        1,
        Modalidad.DELIVERY,
        MetodoPago.TRANSFERENCIA,
        'Av. Nazca 2500',
        [],
        EstadoPedido.EN_PREPARACION,
        21900,
        50,
        false,
        '+54 9 11 5000-1234',
        'Tocar timbre 3A',
        `${historial.HOY}T12:40`
    ),
    new Pedido(
        2,
        2,
        Modalidad.TAKEAWAY,
        MetodoPago.DEBITO,
        null,
        [],
        EstadoPedido.PENDIENTE,
        20900,
        30,
        true,
        '+54 9 11 6021-7788',
        null,
        `${historial.HOY}T13:05`
    ),
    ...historial.pedidos.map(
        (p) =>
            new Pedido(p.id, p.clienteId, p.modalidad, p.metodoPago, p.direccion, [], p.estado, p.precioTotal, p.tiempoEstimadoMin, p.pagoRecibido, p.telefono, p.indicaciones, p.creadoEn)
    )
];

const nextId = createIdGenerator(Math.max(...pedidos.map((p) => p.id)) + 1);

function findAll() {
    return pedidos;
}

function findById(id) {
    return pedidos.find((pedido) => pedido.id === id) || null;
}

function findByClienteId(clienteId) {
    return pedidos.filter((pedido) => pedido.clienteId === clienteId);
}

function create(datos) {
    const pedido = new Pedido(
        nextId(),
        datos.clienteId,
        datos.modalidad,
        datos.metodoPago,
        datos.direccion,
        [],
        datos.estado,
        datos.precioTotal,
        datos.tiempoEstimadoMin,
        datos.pagoRecibido,
        datos.telefono,
        datos.indicaciones,
        datos.creadoEn
    );

    pedidos.push(pedido);
    return pedido;
}

function update(id, datos) {
    const pedido = findById(id);
    if (!pedido) {
        return null;
    }

    Object.assign(pedido, datos);
    return pedido;
}

function remove(id) {
    const indice = pedidos.findIndex((pedido) => pedido.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = pedidos.splice(indice, 1);
    return eliminado;
}

module.exports = {
    findAll,
    findById,
    findByClienteId,
    create,
    update,
    remove
};
