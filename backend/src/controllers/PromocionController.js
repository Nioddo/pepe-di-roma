const PromocionService = require('../services/PromocionService');
const { successResponse } = require('../responses/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const destinatarios = asyncHandler((req, res) => {
    return successResponse(res, PromocionService.contarDestinatarios());
});

const enviar = asyncHandler(async (req, res) => {
    const resultado = await PromocionService.enviar(req.body);
    return successResponse(res, resultado, 201);
});

module.exports = { destinatarios, enviar };
