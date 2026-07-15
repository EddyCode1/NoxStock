import mongoose from 'mongoose';
import Warehouse from '../models/Warehouse.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getWarehouses = async (req, res, next) => {
  try {
    const { q, activo } = req.query;
    const filter = {};

    if (q) {
      filter.nombre = { $regex: q.trim(), $options: 'i' };
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    const warehouses = await Warehouse.find(filter).sort({ nombre: 1 });

    return successResponse(res, 200, 'Bodegas obtenidas correctamente', {
      total: warehouses.length,
      warehouses,
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de bodega inválido', 'INVALID_ID');
    }

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    return successResponse(res, 200, 'Bodega obtenida correctamente', { warehouse });
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    return successResponse(res, 201, 'Bodega creada correctamente', { warehouse });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de bodega inválido', 'INVALID_ID');
    }

    const warehouse = await Warehouse.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    return successResponse(res, 200, 'Bodega actualizada correctamente', { warehouse });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de bodega inválido', 'INVALID_ID');
    }

    const warehouse = await Warehouse.findByIdAndDelete(id);

    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    return successResponse(res, 200, 'Bodega eliminada correctamente', { warehouse });
  } catch (error) {
    next(error);
  }
};
