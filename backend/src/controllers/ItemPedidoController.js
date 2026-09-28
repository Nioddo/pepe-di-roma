const ItemPedidoService = require('../services/ItemPedidoService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerTodos = asyncHandler((req, res) => {
    const items = ItemPedidoService.obtenerTodos();
    return successResponse(res, items);
});

const obtenerPorId = asyncHandler((req, res) => {
    const item = ItemPedidoService.obtenerPorId(req.params.id);
    return successResponse(res, item);
});

const crear = asyncHandler((req, res) => {
    const item = ItemPedidoService.crear(req.body);
    return successResponse(res, item, 201);
});

const modificar = asyncHandler((req, res) => {
    const item = ItemPedidoService.modificar(req.params.id, req.body);
    return successResponse(res, item);
});

const eliminar = asyncHandler((req, res) => {
    const item = ItemPedidoService.eliminar(req.params.id);
    return successResponse(res, item);
});

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
