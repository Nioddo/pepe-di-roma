const { NotFoundError } = require('../exceptions/AppError');
const Messages = require('../enums/Messages');

function notFoundHandler(req, res, next) {
    next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
}

module.exports = notFoundHandler;
