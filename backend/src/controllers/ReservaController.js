const ReservaService = require('../services/ReservaService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Controller de Reservas.
 * Solo traduce HTTP <-> service: lee req, delega, responde.
 */

const obtenerTodas = asyncHandler((req, res) => {
    const reservas = ReservaService.obtenerTodas();
    return successResponse(res, reservas);
});

const obtenerPorId = asyncHandler((req, res) => {
    const reserva = ReservaService.obtenerPorId(req.params.id);
    return successResponse(res, reserva);
});

const crear = asyncHandler((req, res) => {
    const reserva = ReservaService.crear(req.body);
    return successResponse(res, reserva, 201);
});

const modificar = asyncHandler((req, res) => {
    const reserva = ReservaService.modificar(req.params.id, req.body);
    return successResponse(res, reserva);
});

const eliminar = asyncHandler((req, res) => {
    const reserva = ReservaService.eliminar(req.params.id);
    return successResponse(res, reserva);
});

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    modificar,
    eliminar
};
