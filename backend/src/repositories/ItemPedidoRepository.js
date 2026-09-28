const ItemPedido = require('../models/ItemPedido');
const { createIdGenerator } = require('../utils/idGenerator');

const items = [
    new ItemPedido(1, 1, 1, 'Milanesa napolitana', 9500, 2),
    new ItemPedido(2, 2, 2, 'Ravioles de ricota', 8700, 1),
    new ItemPedido(3, 2, 3, 'Ensalada Cesar', 6400, 1)
];

const nextId = createIdGenerator(items.length + 1);

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
