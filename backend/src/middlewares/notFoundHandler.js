const { NotFoundError } = require('../exceptions/AppError');
const Messages = require('../enums/Messages');

/**
 * Captura cualquier request que no haya matcheado ninguna ruta y la convierte
 * en un NotFoundError, para que la respuesta salga por el errorHandler con el
 * mismo formato que el resto de los errores de la app.
 */
function notFoundHandler(req, res, next) {
    next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
}

module.exports = notFoundHandler;
