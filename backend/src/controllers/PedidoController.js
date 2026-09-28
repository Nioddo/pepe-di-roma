const PedidoService = require('../services/PedidoService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerTodos = asyncHandler((req, res) => {
    const pedidos = PedidoService.obtenerTodos();
    return successResponse(res, pedidos);
});

const obtenerPorId = asyncHandler((req, res) => {
    const pedido = PedidoService.obtenerPorId(req.params.id);
    return successResponse(res, pedido);
});

const crear = asyncHandler((req, res) => {
    const pedido = PedidoService.crear(req.body);
    return successResponse(res, pedido, 201);
});

const modificar = asyncHandler((req, res) => {
    const pedido = PedidoService.modificar(req.params.id, req.body);
    return successResponse(res, pedido);
});

const eliminar = asyncHandler((req, res) => {
    const pedido = PedidoService.eliminar(req.params.id);
    return successResponse(res, pedido);
});

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
