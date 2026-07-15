import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import { increaseStock } from '../helpers/stock.js';
import { getAuditUser } from '../helpers/audit.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getEntries = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const filter = {};

    if (productId) {
      if (!isValidObjectId(productId)) {
        return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
      }
      filter.productId = productId;
    }

    const entries = await Entry.find(filter)
      .populate('productId', 'nombre categoria precio existencia')
      .sort({ fecha: -1 });

    return successResponse(res, 200, 'Entradas obtenidas correctamente', {
      total: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const registerEntry = async (req, res, next) => {
  try {
    const { productId, cantidad, motivo } = req.body;

    if (!isValidObjectId(productId)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await increaseStock(productId, cantidad);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const entry = await Entry.create({
      productId,
      cantidad,
      motivo,
      registradoPor: getAuditUser(req),
    });

    return successResponse(res, 201, 'Entrada registrada correctamente', {
      entry,
      product,
    });
  } catch (error) {
    next(error);
  }
};
