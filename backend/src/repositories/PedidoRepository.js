const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const EstadoPedido = require('../enums/EstadoPedido');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de Pedidos.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

const pedidos = [
    new Pedido(
        1,
        10,
        Modalidad.DELIVERY,
        MetodoPago.EFECTIVO,
        'Av. Siempreviva 742',
        [new ItemPedido(1, 'Milanesa napolitana', 9500, 2)],
        EstadoPedido.EN_CAMINO,
        19000,
        45,
        false
    ),
    new Pedido(
        2,
        11,
        Modalidad.TAKEAWAY,
        MetodoPago.DEBITO,
        null,
        [new ItemPedido(2, 'Ravioles de ricota', 8700, 1)],
        EstadoPedido.PENDIENTE,
        8700,
        20,
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

function create(datos) {
    const pedido = new Pedido(
        nextId(),
        datos.clienteId,
        datos.modalidad,
        datos.metodoPago,
        datos.direccion,
        datos.items,
        datos.estado,
        datos.precioTotal,
        datos.tiempoEstimadoMin,
        datos.pagoRecibido
    );

    pedidos.push(pedido);
    return pedido;
}

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {Pedido|null} el pedido actualizado, o null si no existe
 */
function update(id, datos) {
    const pedido = findById(id);
    if (!pedido) {
        return null;
    }

    Object.assign(pedido, datos);
    return pedido;
}

/**
 * @returns {Pedido|null} el pedido eliminado, o null si no existe
 */
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
    create,
    update,
    remove
};
