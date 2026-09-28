const PlatoService = require('../services/PlatoService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerTodos = asyncHandler((req, res) => {
    const platos = PlatoService.obtenerTodos();
    return successResponse(res, platos);
});

const obtenerPorId = asyncHandler((req, res) => {
    const plato = PlatoService.obtenerPorId(req.params.id);
    return successResponse(res, plato);
});

const crear = asyncHandler((req, res) => {
    const plato = PlatoService.crear(req.body);
    return successResponse(res, plato, 201);
});

const modificar = asyncHandler((req, res) => {
    const plato = PlatoService.modificar(req.params.id, req.body);
    return successResponse(res, plato);
});

const eliminar = asyncHandler((req, res) => {
    const plato = PlatoService.eliminar(req.params.id);
    return successResponse(res, plato);
});

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
