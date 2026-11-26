const DifusionService = require('../services/DifusionService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const obtenerEstado = asyncHandler((req, res) => {
    const estado = DifusionService.obtenerEstado();
    return successResponse(res, estado);
});

const enviar = asyncHandler(async (req, res) => {
    const envio = await DifusionService.enviar(req.body);
    return successResponse(res, envio, 201);
});

module.exports = {
    obtenerEstado,
    enviar
};
