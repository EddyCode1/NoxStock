import mongoose from 'mongoose';
import Warehouse from '../models/Warehouse.js';
import { errorResponse } from '../helpers/response.js';

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

export const isCentralWarehouse = async (warehouseId) => {
  const warehouse = await Warehouse.findById(warehouseId).select('esCentral nombre');
  return Boolean(warehouse?.esCentral);
};

export const getBranchWarehouseIds = async () => {
  const branches = await Warehouse.find({ esCentral: { $ne: true }, activo: { $ne: false } }).select(
    '_id'
  );
  return branches.map((warehouse) => warehouse._id);
};

export const buildWarehouseScopeFilter = async (warehouseId) => {
  const isCentral = await isCentralWarehouse(warehouseId);

  if (isCentral) {
    const branchIds = await getBranchWarehouseIds();
    return { warehouseId: { $in: branchIds } };
  }

  return { warehouseId };
};

export const rejectCentralWrite = async (warehouseId, res) => {
  const isCentral = await isCentralWarehouse(warehouseId);

  if (isCentral) {
    errorResponse(
      res,
      400,
      'Central es vista consolidada. Seleccione una sucursal operativa para registrar cambios.',
      'CENTRAL_READ_ONLY'
    );
    return true;
  }

  return false;
};
