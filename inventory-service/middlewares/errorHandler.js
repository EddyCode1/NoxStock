import { errorResponse } from '../helpers/response.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, 'Ruta no encontrada', 'NOT_FOUND');
};

export const errorHandler = (err, req, res, next) => {
  console.error('Inventory Service | error:', err.message);

  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, 'Error de validación', err.message);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 400, 'Identificador inválido', 'INVALID_ID');
  }

  if (err.code === 11000) {
    return errorResponse(res, 409, 'Registro duplicado', 'DUPLICATE_KEY');
  }

  return errorResponse(
    res,
    500,
    'Error interno del servidor',
    process.env.NODE_ENV === 'development' ? err.message : 'INTERNAL_ERROR'
  );
};
