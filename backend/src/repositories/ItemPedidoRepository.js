const ItemPedido = require('../models/ItemPedido');
const { createIdGenerator } = require('../utils/idGenerator');

/**
 * Persistencia en memoria de los Items de Pedido.
 * Es la unica fuente de verdad de los items: cada uno apunta a su pedido
 * por pedidoId, y PedidoService los adjunta al pedido cuando lo devuelve.
 * CRUD puro sobre el array: no valida ni decide nada de negocio.
 */

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

/**
 * Sobrescribe solo las claves presentes en datos.
 * @returns {ItemPedido|null} el item actualizado, o null si no existe
 */
function update(id, datos) {
    const item = findById(id);
    if (!item) {
        return null;
    }

    Object.assign(item, datos);
    return item;
}

/**
 * @returns {ItemPedido|null} el item eliminado, o null si no existe
 */
function remove(id) {
    const indice = items.findIndex((item) => item.id === id);
    if (indice === -1) {
        return null;
    }

    const [eliminado] = items.splice(indice, 1);
    return eliminado;
}

/** Borra todos los items de un pedido. La usa PedidoService al eliminar o reemplazar items. */
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
