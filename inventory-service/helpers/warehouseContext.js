import mongoose from 'mongoose';
import Warehouse from '../models/Warehouse.js';
import { errorResponse } from './response.js';

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const resolveWarehouseId = (req) => {
  const id = req.query?.warehouseId || req.body?.warehouseId;

  if (!id || !isValidObjectId(id)) {
    return null;
  }

  return id;
};

export const requireWarehouseId = (req, res) => {
  const warehouseId = resolveWarehouseId(req);

  if (!warehouseId) {
    errorResponse(res, 400, 'El parámetro warehouseId es obligatorio', 'MISSING_WAREHOUSE_ID');
    return null;
  }

  return warehouseId;
};

export const ensureWarehouseExists = async (warehouseId) => {
  const warehouse = await Warehouse.findById(warehouseId);
  return warehouse;
};
