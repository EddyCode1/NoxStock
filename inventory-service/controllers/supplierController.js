import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import {
  buildWarehouseScopeFilter,
  ensureWarehouseExists,
  rejectCentralWrite,
  requireWarehouseId,
} from '../helpers/warehouseContext.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function findSupplierInScope(id, warehouseId) {
  const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
  return Supplier.findOne({ _id: id, ...scopeFilter });
}

export const getSuppliers = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    const { q, activo } = req.query;
    const filter = await buildWarehouseScopeFilter(warehouseId);

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
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    const supplier = await findSupplierInScope(id, warehouseId);

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
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    const supplier = await Supplier.create({
      ...req.body,
      warehouseId,
    });

    return successResponse(res, 201, 'Proveedor creado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    const supplier = await findSupplierInScope(id, warehouseId);

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    const { warehouseId: _ignored, ...updates } = req.body;
    Object.assign(supplier, updates);
    await supplier.save();

    return successResponse(res, 200, 'Proveedor actualizado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    const supplier = await findSupplierInScope(id, warehouseId);

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
    const openOrders = await PurchaseOrder.countDocuments({
      supplierId: id,
      estado: { $in: ['borrador', 'enviada'] },
      ...scopeFilter,
    });

    if (openOrders > 0) {
      return errorResponse(
        res,
        409,
        'No se puede eliminar un proveedor con órdenes de compra abiertas',
        'SUPPLIER_HAS_OPEN_ORDERS'
      );
    }

    await supplier.deleteOne();

    return successResponse(res, 200, 'Proveedor eliminado correctamente', { supplier });
  } catch (error) {
    next(error);
  }
};
