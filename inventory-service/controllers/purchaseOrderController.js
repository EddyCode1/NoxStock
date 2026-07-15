import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Entry from '../models/Entry.js';
import { increaseStock } from '../helpers/stock.js';
import { getAuditUser } from '../helpers/audit.js';
import {
  buildWarehouseScopeFilter,
  ensureWarehouseExists,
  rejectCentralWrite,
  requireWarehouseId,
  resolveWarehouseId,
} from '../helpers/warehouseContext.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateOptions = [
  { path: 'supplierId', select: 'nombre contacto email telefono' },
  { path: 'warehouseId', select: 'nombre direccion lat lng' },
  { path: 'items.productId', select: 'nombre categoria precio existencia' },
];

async function validateItems(items) {
  for (const item of items) {
    if (!isValidObjectId(item.productId)) {
      return 'ID de producto inválido en la orden';
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      return `Producto no encontrado: ${item.productId}`;
    }
  }

  return null;
}

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const { estado, supplierId } = req.query;
    const filter = {};

    if (estado) {
      filter.estado = estado;
    }

    if (supplierId) {
      if (!isValidObjectId(supplierId)) {
        return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
      }
      filter.supplierId = supplierId;
    }

    const warehouseId = resolveWarehouseId(req);
    if (warehouseId) {
      const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
      Object.assign(filter, scopeFilter);
    }

    const orders = await PurchaseOrder.find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Órdenes de compra obtenidas correctamente', {
      total: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de orden inválido', 'INVALID_ID');
    }

    const order = await PurchaseOrder.findById(id).populate(populateOptions);

    if (!order) {
      return errorResponse(res, 404, 'Orden de compra no encontrada', 'ORDER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Orden de compra obtenida correctamente', { order });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplierId, items, notas } = req.body;
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    if (await rejectCentralWrite(warehouseId, res)) {
      return;
    }

    if (!isValidObjectId(supplierId)) {
      return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
    }

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
    }

    const itemError = await validateItems(items);

    if (itemError) {
      return errorResponse(res, 400, itemError, 'INVALID_ORDER_ITEMS');
    }

    const order = await PurchaseOrder.create({
      supplierId,
      warehouseId,
      items,
      notas: notas || '',
      creadoPor: req.user?.email || req.user?.id || '',
      estado: 'borrador',
    });

    await order.populate(populateOptions);

    return successResponse(res, 201, 'Orden de compra creada correctamente', { order });
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de orden inválido', 'INVALID_ID');
    }

    const order = await PurchaseOrder.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'Orden de compra no encontrada', 'ORDER_NOT_FOUND');
    }

    if (order.estado !== 'borrador') {
      return errorResponse(
        res,
        409,
        'Solo se pueden editar órdenes en estado borrador',
        'ORDER_NOT_EDITABLE'
      );
    }

    if (req.body.items) {
      const itemError = await validateItems(req.body.items);

      if (itemError) {
        return errorResponse(res, 400, itemError, 'INVALID_ORDER_ITEMS');
      }

      order.items = req.body.items;
    }

    if (req.body.notas !== undefined) {
      order.notas = req.body.notas;
    }

    if (req.body.supplierId) {
      if (!isValidObjectId(req.body.supplierId)) {
        return errorResponse(res, 400, 'ID de proveedor inválido', 'INVALID_ID');
      }

      const supplier = await Supplier.findById(req.body.supplierId);

      if (!supplier) {
        return errorResponse(res, 404, 'Proveedor no encontrado', 'SUPPLIER_NOT_FOUND');
      }

      order.supplierId = req.body.supplierId;
    }

    await order.save();
    await order.populate(populateOptions);

    return successResponse(res, 200, 'Orden de compra actualizada correctamente', { order });
  } catch (error) {
    next(error);
  }
};

export const sendPurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de orden inválido', 'INVALID_ID');
    }

    const order = await PurchaseOrder.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'Orden de compra no encontrada', 'ORDER_NOT_FOUND');
    }

    if (order.estado !== 'borrador') {
      return errorResponse(res, 409, 'La orden ya fue enviada o cerrada', 'INVALID_ORDER_STATUS');
    }

    order.estado = 'enviada';
    order.fechaEnvio = new Date();
    await order.save();
    await order.populate(populateOptions);

    return successResponse(res, 200, 'Orden de compra enviada al proveedor', { order });
  } catch (error) {
    next(error);
  }
};

export const receivePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de orden inválido', 'INVALID_ID');
    }

    const order = await PurchaseOrder.findById(id).populate('supplierId', 'nombre');

    if (!order) {
      return errorResponse(res, 404, 'Orden de compra no encontrada', 'ORDER_NOT_FOUND');
    }

    if (order.estado !== 'enviada') {
      return errorResponse(
        res,
        409,
        'Solo se pueden recibir órdenes en estado enviada',
        'INVALID_ORDER_STATUS'
      );
    }

    const entries = [];
    const supplierName = order.supplierId?.nombre || 'proveedor';

    for (const item of order.items) {
      const stock = await increaseStock(item.productId, order.warehouseId, item.cantidad);

      if (!stock) {
        return errorResponse(res, 404, 'Producto no encontrado al recibir orden', 'PRODUCT_NOT_FOUND');
      }

      const entry = await Entry.create({
        productId: item.productId,
        warehouseId: order.warehouseId,
        cantidad: item.cantidad,
        motivo: `OC-${order._id} recepción ${supplierName}`,
        registradoPor: getAuditUser(req),
      });

      entries.push(entry);
    }

    order.estado = 'recibida';
    order.fechaRecepcion = new Date();
    await order.save();
    await order.populate(populateOptions);

    return successResponse(res, 200, 'Orden recibida e inventario actualizado', {
      order,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de orden inválido', 'INVALID_ID');
    }

    const order = await PurchaseOrder.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'Orden de compra no encontrada', 'ORDER_NOT_FOUND');
    }

    if (!['borrador', 'enviada'].includes(order.estado)) {
      return errorResponse(res, 409, 'La orden no se puede cancelar', 'INVALID_ORDER_STATUS');
    }

    order.estado = 'cancelada';
    await order.save();
    await order.populate(populateOptions);

    return successResponse(res, 200, 'Orden de compra cancelada', { order });
  } catch (error) {
    next(error);
  }
};
