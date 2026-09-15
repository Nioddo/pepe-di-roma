/**
 * Envuelve un handler de Express y deriva cualquier error al errorHandler.
 * Evita repetir try/catch en cada metodo de los controllers y deja preparado
 * el camino para cuando los services pasen a ser asincronicos (base de datos).
 */
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = { asyncHandler };
