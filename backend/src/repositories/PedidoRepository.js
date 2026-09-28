const Pedido = require('../models/Pedido');
const EstadoPedido = require('../enums/EstadoPedido');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const { createIdGenerator } = require('../utils/idGenerator');

const pedidos = [
    new Pedido(
        1,
        1,
        Modalidad.DELIVERY,
        MetodoPago.EFECTIVO,
        'Av. Siempreviva 742',
        [],
        EstadoPedido.EN_CAMINO,
        19000,
        45,
        false
    ),
    new Pedido(
        2,
        2,
        Modalidad.TAKEAWAY,
        MetodoPago.DEBITO,
        null,
        [],
        EstadoPedido.PENDIENTE,
        15100,
        25,
        true
    )
];

const nextId = createIdGenerator(pedidos.length + 1);

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
        datos.pagoRecibido
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
