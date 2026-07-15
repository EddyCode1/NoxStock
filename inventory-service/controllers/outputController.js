import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Output from '../models/Output.js';
import { decreaseStock } from '../helpers/stock.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getOutputs = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const filter = {};

    if (productId) {
      if (!isValidObjectId(productId)) {
        return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
      }
      filter.productId = productId;
    }

    const outputs = await Output.find(filter)
      .populate('productId', 'nombre categoria precio existencia')
      .sort({ fecha: -1 });

    return successResponse(res, 200, 'Salidas obtenidas correctamente', {
      total: outputs.length,
      outputs,
    });
  } catch (error) {
    next(error);
  }
};

export const registerOutput = async (req, res, next) => {
  try {
    const { productId, cantidad, motivo } = req.body;

    if (!isValidObjectId(productId)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await decreaseStock(productId, cantidad);

    if (!product) {
      const exists = await Product.findById(productId);

      if (!exists) {
        return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      return errorResponse(res, 400, 'Existencia insuficiente para la salida', 'INSUFFICIENT_STOCK');
    }

    const output = await Output.create({
      productId,
      cantidad,
      motivo,
    });

    return successResponse(res, 201, 'Salida registrada correctamente', {
      output,
      product,
    });
  } catch (error) {
    next(error);
  }
};
