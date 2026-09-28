const ItemPedidoRepository = require('../repositories/ItemPedidoRepository');
const PedidoRepository = require('../repositories/PedidoRepository');
const PlatoRepository = require('../repositories/PlatoRepository');
const PedidoService = require('./PedidoService');
const Messages = require('../enums/Messages');
const { BadRequestError, NotFoundError, ConflictError } = require('../exceptions/AppError');

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarPedido(pedidoId) {
    const numero = Number(pedidoId);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.ITEM_PEDIDO_PEDIDO_REQUIRED);
    }

    if (!PedidoRepository.findById(numero)) {
        throw new NotFoundError(Messages.PEDIDO_NOT_FOUND);
    }

    return numero;
}

function obtenerPlato(platoId) {
    const numero = Number(platoId);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.PEDIDO_ITEM_INVALID);
    }

    const plato = PlatoRepository.findById(numero);
    if (!plato) {
        throw new NotFoundError(Messages.PLATO_NOT_FOUND);
    }

    return plato;
}

function validarCantidad(cantidad) {
    const numero = Number(cantidad);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.ITEM_PEDIDO_CANTIDAD_INVALID);
    }
    return numero;
}

function obtenerTodos() {
    return ItemPedidoRepository.findAll();
}

function obtenerPorId(id) {
    const itemId = parsearId(id);
    const item = ItemPedidoRepository.findById(itemId);

    if (!item) {
        throw new NotFoundError(Messages.ITEM_PEDIDO_NOT_FOUND);
    }

    return item;
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const pedidoId = validarPedido(body.pedidoId);
    const plato = obtenerPlato(body.platoId);
    const cantidad = validarCantidad(body.cantidad);

    const item = ItemPedidoRepository.create({
        pedidoId,
        platoId: plato.id,
        nombre: plato.nombre,
        precioUnitario: plato.precio,
        cantidad
    });

    PedidoService.recalcularTotales(pedidoId);
    return item;
}

function modificar(id, body) {
    const item = obtenerPorId(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    if (body.pedidoId !== undefined && Number(body.pedidoId) !== item.pedidoId) {
        throw new BadRequestError(Messages.ITEM_PEDIDO_PEDIDO_INMUTABLE);
    }

    const cambios = {};

    if (body.platoId !== undefined) {
        const plato = obtenerPlato(body.platoId);
        cambios.platoId = plato.id;
        cambios.nombre = plato.nombre;
        cambios.precioUnitario = plato.precio;
    }
    if (body.cantidad !== undefined) {
        cambios.cantidad = validarCantidad(body.cantidad);
    }

    const actualizado = ItemPedidoRepository.update(item.id, cambios);

    PedidoService.recalcularTotales(item.pedidoId);
    return actualizado;
}

function eliminar(id) {
    const item = obtenerPorId(id);

    if (ItemPedidoRepository.findByPedidoId(item.pedidoId).length === 1) {
        throw new ConflictError(Messages.ITEM_PEDIDO_ULTIMO);
    }

    const eliminado = ItemPedidoRepository.remove(item.id);

    PedidoService.recalcularTotales(item.pedidoId);
    return eliminado;
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
