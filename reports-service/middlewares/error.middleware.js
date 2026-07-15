export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
    });
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = Number.isInteger(error.statusCode)
        ? error.statusCode
        : Number.isInteger(error.status)
            ? error.status
            : 500;

    const payload = {
        success: false,
        message: error.message || 'Error interno del servidor',
    };

    if (error.details) {
        payload.details = error.details;
    }

    if (process.env.NODE_ENV !== 'production' && error.stack) {
        payload.stack = error.stack;
    }

    res.status(statusCode).json(payload);
}