const SeccionService = require('../services/SeccionService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Controller de Secciones.
 * Solo traduce HTTP <-> service: lee req, delega, responde.
 */

const obtenerTodas = asyncHandler((req, res) => {
    const secciones = SeccionService.obtenerTodas();
    return successResponse(res, secciones);
});

const obtenerPorId = asyncHandler((req, res) => {
    const seccion = SeccionService.obtenerPorId(req.params.id);
    return successResponse(res, seccion);
});

const crear = asyncHandler((req, res) => {
    const seccion = SeccionService.crear(req.body);
    return successResponse(res, seccion, 201);
});

const modificar = asyncHandler((req, res) => {
    const seccion = SeccionService.modificar(req.params.id, req.body);
    return successResponse(res, seccion);
});

const eliminar = asyncHandler((req, res) => {
    const seccion = SeccionService.eliminar(req.params.id);
    return successResponse(res, seccion);
});

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
