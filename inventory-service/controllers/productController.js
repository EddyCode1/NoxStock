import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getProducts = async (req, res, next) => {
  try {
    const { q, categoria } = req.query;
    const filter = {};

    if (q) {
      filter.nombre = { $regex: q.trim(), $options: 'i' };
    }

    if (categoria) {
      filter.categoria = { $regex: categoria.trim(), $options: 'i' };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Productos obtenidos correctamente', {
      total: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    return successResponse(res, 200, 'Producto obtenido correctamente', { product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { nombre, categoria, precio, existencia } = req.body;

    const product = await Product.create({
      nombre,
      categoria,
      precio,
      existencia: existencia ?? 0,
    });

    return successResponse(res, 201, 'Producto creado correctamente', { product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const { nombre, categoria, precio } = req.body;
    const updateData = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (precio !== undefined) updateData.precio = precio;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    return successResponse(res, 200, 'Producto actualizado correctamente', { product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    return successResponse(res, 200, 'Producto eliminado correctamente', { product });
  } catch (error) {
    next(error);
  }
};
