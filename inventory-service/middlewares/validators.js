import { validationResult } from 'express-validator';
import { errorResponse } from '../helpers/response.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Datos inválidos', errors.array());
  }

  next();
};
