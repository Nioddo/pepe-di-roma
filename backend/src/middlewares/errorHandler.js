const { AppError } = require('../exceptions/AppError');
const { errorResponse } = require('../responses/apiResponse');
const Messages = require('../enums/Messages');

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return errorResponse(res, err.message, err.statusCode);
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return errorResponse(res, Messages.INVALID_DATA, 400);
    }

    if (err.type === 'entity.too.large') {
        return errorResponse(res, Messages.DIFUSION_MUY_PESADO, 413);
    }

    console.error('[ERROR NO CONTROLADO]', err);
    return errorResponse(res, Messages.INTERNAL_ERROR, 500);
}

module.exports = errorHandler;
