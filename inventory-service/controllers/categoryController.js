import Product from '../models/Product.js';
import { successResponse } from '../helpers/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('categoria');

    return successResponse(res, 200, 'Categorías obtenidas correctamente', {
      total: categories.length,
      categories: categories.sort((a, b) => a.localeCompare(b, 'es')),
    });
  } catch (error) {
    next(error);
  }
};
