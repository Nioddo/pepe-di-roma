const ItemPedido = require('../models/ItemPedido');
const Carta = require('../enums/Carta');
const { createIdGenerator } = require('../utils/idGenerator');
const { platoDeCarta } = require('../data/cartaSeed');
const historial = require('../data/historialSeed');

function itemSemilla(id, pedidoId, nombre, cantidad) {
    const plato = platoDeCarta(Carta.PER_PORTARE_VIA, nombre);
    return new ItemPedido(id, pedidoId, plato.id, plato.nombre, plato.precio, cantidad);
}

const items = [
    itemSemilla(1, 1, 'Cappelacci', 2),
    itemSemilla(2, 1, 'Pomodoro', 1),
    itemSemilla(3, 2, 'Tiramisù', 1),
    itemSemilla(4, 2, 'Cornetto', 2),
    ...historial.items.map((i) => new ItemPedido(i.id, i.pedidoId, i.platoId, i.nombre, i.precioUnitario, i.cantidad))
];

const nextId = createIdGenerator(Math.max(...items.map((i) => i.id)) + 1);

function findAll() {
    return items;
}

function findById(id) {
    return items.find((item) => item.id === id) || null;
}

function findByPedidoId(pedidoId) {
    return items.filter((item) => item.pedidoId === pedidoId);
}

function create(datos) {
    const item = new ItemPedido(
        nextId(),
        datos.pedidoId,
        datos.platoId,
        datos.nombre,
        datos.precioUnitario,
        datos.cantidad
    );

    items.push(item);
    return item;
}

function update(id, datos) {
    const item = findById(id);
    if (!item) {
        return null;
    }

    Object.assign(item, datos);
    return item;
}

function remove(id) {
    const indice = items.findIndex((item) => item.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = items.splice(indice, 1);
    return eliminado;
}

function removeByPedidoId(pedidoId) {
    const eliminados = findByPedidoId(pedidoId);
    eliminados.forEach((item) => remove(item.id));
    return eliminados;
}

module.exports = {
    findAll,
    findById,
    findByPedidoId,
    create,
    update,
    remove,
    removeByPedidoId
};
