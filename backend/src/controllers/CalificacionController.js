const CalificacionService = require('../services/CalificacionService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerTodas = asyncHandler((req, res) => {
    const calificaciones = CalificacionService.obtenerTodas();
    return successResponse(res, calificaciones);
});

const obtenerPorId = asyncHandler((req, res) => {
    const calificacion = CalificacionService.obtenerPorId(req.params.id);
    return successResponse(res, calificacion);
});

const crear = asyncHandler((req, res) => {
    const calificacion = CalificacionService.crear(req.body);
    return successResponse(res, calificacion, 201);
});

const modificar = asyncHandler((req, res) => {
    const calificacion = CalificacionService.modificar(req.params.id, req.body);
    return successResponse(res, calificacion);
});

const eliminar = asyncHandler((req, res) => {
    const calificacion = CalificacionService.eliminar(req.params.id);
    return successResponse(res, calificacion);
});

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
