import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import {
  buildWarehouseScopeFilter,
  ensureWarehouseExists,
  rejectCentralWrite,
  requireWarehouseId,
} from '../helpers/warehouseContext.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function findCustomerInScope(id, warehouseId) {
  const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
  return Customer.findOne({ _id: id, ...scopeFilter });
}

export const getCustomers = async (req, res, next) => {
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

    const customers = await Customer.find(filter).sort({ nombre: 1 });

    return successResponse(res, 200, 'Clientes obtenidos correctamente', {
      total: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    const customer = await findCustomerInScope(id, warehouseId);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Cliente obtenido correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
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

    const customer = await Customer.create({
      ...req.body,
      warehouseId,
    });

    return successResponse(res, 201, 'Cliente creado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    const customer = await findCustomerInScope(id, warehouseId);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    const { warehouseId: _ignored, ...updates } = req.body;
    Object.assign(customer, updates);
    await customer.save();

    return successResponse(res, 200, 'Cliente actualizado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    const customer = await findCustomerInScope(id, warehouseId);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
    const openSales = await Sale.countDocuments({
      customerId: id,
      estado: 'borrador',
      ...scopeFilter,
    });

    if (openSales > 0) {
      return errorResponse(
        res,
        409,
        'No se puede eliminar un cliente con ventas en borrador',
        'CUSTOMER_HAS_OPEN_SALES'
      );
    }

    await customer.deleteOne();

    return successResponse(res, 200, 'Cliente eliminado correctamente', { customer });
  } catch (error) {
    next(error);
  }
};
