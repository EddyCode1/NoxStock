import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getSuppliers = async (req, res, next) => {
  try {
    const { q, activo } = req.query;
    const filter = {};

    if (q) {
      filter.nombre = { $regex: q.trim(), $options: 'i' };
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    const suppliers = await Supplier.find(filter).sort({ nombre: 1 });

    return successResponse(res, 200, 'Proveedores obtenidos correctamente', {
      total: suppliers.length,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Proveedor obtenido correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);

    return successResponse(res, 201, 'Proveedor creado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    const supplier = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Proveedor actualizado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    const openOrders = await PurchaseOrder.countDocuments({
      supplierId: id,
      estado: { $in: ['borrador', 'enviada'] },
    });

    if (openOrders > 0) {
      return errorResponse(
        res,
        409,
        'No se puede eliminar un proveedor con órdenes de compra abiertas',
        'SUPPLIER_HAS_OPEN_ORDERS'
      );
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Proveedor eliminado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};
