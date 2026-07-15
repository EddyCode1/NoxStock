import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Output from '../models/Output.js';
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
  const session = await mongoose.startSession();

  try {
    const { productId, cantidad, motivo } = req.body;

    if (!isValidObjectId(productId)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    session.startTransaction();

    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    if (product.existencia < cantidad) {
      await session.abortTransaction();
      return errorResponse(res, 400, 'Existencia insuficiente para la salida', 'INSUFFICIENT_STOCK');
    }

    product.existencia -= cantidad;
    await product.save({ session });

    const [output] = await Output.create(
      [
        {
          productId,
          cantidad,
          motivo,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return successResponse(res, 201, 'Salida registrada correctamente', {
      output,
      product,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
