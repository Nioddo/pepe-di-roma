/**
 * Error base de la aplicacion.
 * Todo error que la app lanza a proposito (es decir, esperable y con un
 * significado de negocio) extiende de AppError y por lo tanto viaja con
 * su propio statusCode HTTP.
 *
 * El errorHandler usa la marca isOperational para distinguir estos errores
 * de los bugs inesperados, que siempre responden 500.
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/** 400 - El cliente mando datos invalidos. */
class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

/** 404 - El recurso pedido no existe. */
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

/** 409 - El pedido choca con el estado actual de los datos. */
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    NotFoundError,
    ConflictError
};
