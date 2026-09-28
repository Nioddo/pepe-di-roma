const MesaService = require('../services/MesaService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Controller de Mesas.
 * Solo traduce HTTP <-> service: lee req, delega, responde.
 */

const obtenerTodas = asyncHandler((req, res) => {
    const mesas = MesaService.obtenerTodas();
    return successResponse(res, mesas);
});

const obtenerPorId = asyncHandler((req, res) => {
    const mesa = MesaService.obtenerPorId(req.params.id);
    return successResponse(res, mesa);
});

const crear = asyncHandler((req, res) => {
    const mesa = MesaService.crear(req.body);
    return successResponse(res, mesa, 201);
});

const modificar = asyncHandler((req, res) => {
    const mesa = MesaService.modificar(req.params.id, req.body);
    return successResponse(res, mesa);
});

const eliminar = asyncHandler((req, res) => {
    const mesa = MesaService.eliminar(req.params.id);
    return successResponse(res, mesa);
});

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
