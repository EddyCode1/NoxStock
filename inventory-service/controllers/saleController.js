import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Output from '../models/Output.js';
import { decreaseStock } from '../helpers/stock.js';
import { getAuditUser } from '../helpers/audit.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateOptions = [
  { path: 'customerId', select: 'nombre email telefono nit' },
  { path: 'items.productId', select: 'nombre categoria precio existencia' },
];

async function validateItems(items) {
  for (const item of items) {
    if (!isValidObjectId(item.productId)) {
      return 'ID de producto inválido en la venta';
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      return `Producto no encontrado: ${item.productId}`;
    }
  }

  return null;
}

async function validateStock(items) {
  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      return { error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado al confirmar venta' };
    }

    if (product.existencia < item.cantidad) {
      return {
        error: 'INSUFFICIENT_STOCK',
        message: `Stock insuficiente para ${product.nombre}`,
      };
    }
  }

  return null;
}

export const getSales = async (req, res, next) => {
  try {
    const { estado, customerId } = req.query;
    const filter = {};

    if (estado) {
      filter.estado = estado;
    }

    if (customerId) {
      if (!isValidObjectId(customerId)) {
        return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
      }
      filter.customerId = customerId;
    }

    const sales = await Sale.find(filter).populate(populateOptions).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Ventas obtenidas correctamente', {
      total: sales.length,
      sales,
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de venta inválido', 'INVALID_ID');
    }

    const sale = await Sale.findById(id).populate(populateOptions);

    if (!sale) {
      return errorResponse(res, 404, 'Venta no encontrada', 'SALE_NOT_FOUND');
    }

    return successResponse(res, 200, 'Venta obtenida correctamente', { sale });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { customerId, items, notas } = req.body;

    if (!isValidObjectId(customerId)) {
      return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
    }

    const itemError = await validateItems(items);

    if (itemError) {
      return errorResponse(res, 400, itemError, 'INVALID_SALE_ITEMS');
    }

    const sale = await Sale.create({
      customerId,
      items,
      notas: notas || '',
      creadoPor: getAuditUser(req),
      estado: 'borrador',
    });

    await sale.populate(populateOptions);

    return successResponse(res, 201, 'Venta creada correctamente', { sale });
  } catch (error) {
    next(error);
  }
};

export const updateSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de venta inválido', 'INVALID_ID');
    }

    const sale = await Sale.findById(id);

    if (!sale) {
      return errorResponse(res, 404, 'Venta no encontrada', 'SALE_NOT_FOUND');
    }

    if (sale.estado !== 'borrador') {
      return errorResponse(res, 409, 'Solo se pueden editar ventas en borrador', 'SALE_NOT_EDITABLE');
    }

    if (req.body.items) {
      const itemError = await validateItems(req.body.items);

      if (itemError) {
        return errorResponse(res, 400, itemError, 'INVALID_SALE_ITEMS');
      }

      sale.items = req.body.items;
    }

    if (req.body.notas !== undefined) {
      sale.notas = req.body.notas;
    }

    if (req.body.customerId) {
      if (!isValidObjectId(req.body.customerId)) {
        return errorResponse(res, 400, 'ID de cliente inválido', 'INVALID_ID');
      }

      const customer = await Customer.findById(req.body.customerId);

      if (!customer) {
        return errorResponse(res, 404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
      }

      sale.customerId = req.body.customerId;
    }

    await sale.save();
    await sale.populate(populateOptions);

    return successResponse(res, 200, 'Venta actualizada correctamente', { sale });
  } catch (error) {
    next(error);
  }
};

export const confirmSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de venta inválido', 'INVALID_ID');
    }

    const sale = await Sale.findById(id).populate('customerId', 'nombre');

    if (!sale) {
      return errorResponse(res, 404, 'Venta no encontrada', 'SALE_NOT_FOUND');
    }

    if (sale.estado !== 'borrador') {
      return errorResponse(res, 409, 'La venta ya fue confirmada o cerrada', 'INVALID_SALE_STATUS');
    }

    const stockError = await validateStock(sale.items);

    if (stockError) {
      return errorResponse(res, 400, stockError.message, stockError.error);
    }

    const outputs = [];
    const customerName = sale.customerId?.nombre || 'cliente';

    for (const item of sale.items) {
      const product = await decreaseStock(item.productId, item.cantidad);

      if (!product) {
        return errorResponse(res, 400, 'Error al descontar stock', 'INSUFFICIENT_STOCK');
      }

      const output = await Output.create({
        productId: item.productId,
        cantidad: item.cantidad,
        motivo: `VENTA-${sale._id} ${customerName}`,
        registradoPor: getAuditUser(req),
      });

      outputs.push(output);
    }

    sale.estado = 'confirmada';
    sale.fechaConfirmacion = new Date();
    await sale.save();
    await sale.populate(populateOptions);

    return successResponse(res, 200, 'Venta confirmada e inventario actualizado', {
      sale,
      outputs,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de venta inválido', 'INVALID_ID');
    }

    const sale = await Sale.findById(id);

    if (!sale) {
      return errorResponse(res, 404, 'Venta no encontrada', 'SALE_NOT_FOUND');
    }

    if (sale.estado !== 'borrador') {
      return errorResponse(res, 409, 'Solo se pueden cancelar ventas en borrador', 'INVALID_SALE_STATUS');
    }

    sale.estado = 'cancelada';
    await sale.save();
    await sale.populate(populateOptions);

    return successResponse(res, 200, 'Venta cancelada', { sale });
  } catch (error) {
    next(error);
  }
};
