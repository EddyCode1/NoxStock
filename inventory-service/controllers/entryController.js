import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const registerEntry = async (req, res, next) => {
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

    product.existencia += cantidad;
    await product.save({ session });

    const [entry] = await Entry.create(
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

    return successResponse(res, 201, 'Entrada registrada correctamente', {
      entry,
      product,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
