/**
 * Helpers para construir las respuestas HTTP de la API.
 * Centralizan el formato para que ningun controller arme el JSON a mano.
 *
 * Exito: { "success": true,  "data": { ... } }
 * Error: { "success": false, "message": "..." }
 */

/**
 * Responde una operacion exitosa.
 * @param {import('express').Response} res
 * @param {*} data cuerpo de la respuesta
 * @param {number} statusCode por defecto 200
 */
function successResponse(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data: data
    });
}

/**
 * Responde un error. La usa el errorHandler; los controllers no la
 * llaman directamente, solo delegan el error con next(err).
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode por defecto 500
 */
function errorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = {
    successResponse,
    errorResponse
};
