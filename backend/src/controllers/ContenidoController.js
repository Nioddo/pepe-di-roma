const ContenidoService = require('../services/ContenidoService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerTodos = asyncHandler((req, res) => {
    const contenidos = ContenidoService.obtenerTodos();
    return successResponse(res, contenidos);
});

const obtenerPorId = asyncHandler((req, res) => {
    const contenido = ContenidoService.obtenerPorId(req.params.id);
    return successResponse(res, contenido);
});

const crear = asyncHandler((req, res) => {
    const contenido = ContenidoService.crear(req.body);
    return successResponse(res, contenido, 201);
});

const modificar = asyncHandler((req, res) => {
    const contenido = ContenidoService.modificar(req.params.id, req.body);
    return successResponse(res, contenido);
});

const eliminar = asyncHandler((req, res) => {
    const contenido = ContenidoService.eliminar(req.params.id);
    return successResponse(res, contenido);
});

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
