const { AppError } = require('../exceptions/AppError');
const { errorResponse } = require('../responses/apiResponse');
const Messages = require('../enums/Messages');

/**
 * Manejo centralizado de errores.
 * Se registra como ULTIMO middleware de la app.
 *
 * - Si el error es un AppError (esperado, de negocio) responde con su
 *   statusCode y su mensaje.
 * - Si es cualquier otra cosa (bug, error de JS) responde 500 con un mensaje
 *   generico, sin filtrar detalles internos al cliente.
 *
 * Los 4 parametros son obligatorios: asi Express lo reconoce como error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return errorResponse(res, err.message, err.statusCode);
    }

    // JSON mal formado en el body: lo reporta el body-parser de Express.
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return errorResponse(res, Messages.INVALID_DATA, 400);
    }

    // Error inesperado: se loguea completo del lado del servidor.
    console.error('[ERROR NO CONTROLADO]', err);
    return errorResponse(res, Messages.INTERNAL_ERROR, 500);
}

module.exports = errorHandler;
