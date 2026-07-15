import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import { increaseStock } from '../helpers/stock.js';
import { getAuditUser } from '../helpers/audit.js';
import {
  ensureWarehouseExists,
  requireWarehouseId,
  resolveWarehouseId,
} from '../helpers/warehouseContext.js';
import { attachWarehouseStock, getStockMapForWarehouse } from '../helpers/warehouseStock.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getEntries = async (req, res, next) => {
  try {
    const warehouseId = resolveWarehouseId(req);

    if (!warehouseId) {
      return errorResponse(res, 400, 'El parámetro warehouseId es obligatorio', 'MISSING_WAREHOUSE_ID');
    }

    const { productId } = req.query;
    const filter = { warehouseId };

    if (productId) {
      if (!isValidObjectId(productId)) {
        return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
      }
      filter.productId = productId;
    }

    const entries = await Entry.find(filter)
      .populate('productId', 'nombre categoria precio stockMinimo')
      .populate('warehouseId', 'nombre')
      .sort({ fecha: -1 });

    return successResponse(res, 200, 'Entradas obtenidas correctamente', {
      warehouseId,
      total: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const registerEntry = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    const { productId, cantidad, motivo } = req.body;

    if (!isValidObjectId(productId)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const stock = await increaseStock(productId, warehouseId, cantidad);

    if (!stock) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const entry = await Entry.create({
      productId,
      warehouseId,
      cantidad,
      motivo,
      registradoPor: getAuditUser(req),
    });

    const stockMap = await getStockMapForWarehouse(warehouseId, [productId]);
    const [enriched] = attachWarehouseStock([product], stockMap, warehouseId);

    return successResponse(res, 201, 'Entrada registrada correctamente', {
      entry,
      product: enriched,
      warehouse: { _id: warehouse._id, nombre: warehouse.nombre },
    });
  } catch (error) {
    next(error);
  }
};
