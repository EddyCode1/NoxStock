import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Output from '../models/Output.js';
import { decreaseStock } from '../helpers/stock.js';
import { getAuditUser } from '../helpers/audit.js';
import {
  ensureWarehouseExists,
  buildWarehouseScopeFilter,
  isCentralWarehouse,
  rejectCentralWrite,
  requireWarehouseId,
  resolveWarehouseId,
} from '../helpers/warehouseContext.js';
import { attachWarehouseStock, getStockMapForWarehouse } from '../helpers/warehouseStock.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getOutputs = async (req, res, next) => {
  try {
    const warehouseId = resolveWarehouseId(req);

    if (!warehouseId) {
      return errorResponse(res, 400, 'El parámetro warehouseId es obligatorio', 'MISSING_WAREHOUSE_ID');
    }

    const { productId } = req.query;
    const scopeFilter = await buildWarehouseScopeFilter(warehouseId);
    const filter = { ...scopeFilter };

    if (productId) {
      if (!isValidObjectId(productId)) {
        return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
      }
      filter.productId = productId;
    }

    const outputs = await Output.find(filter)
      .populate('productId', 'nombre categoria precio stockMinimo')
      .populate('warehouseId', 'nombre')
      .sort({ fecha: -1 });

    return successResponse(res, 200, 'Salidas obtenidas correctamente', {
      warehouseId,
      vistaConsolidada: await isCentralWarehouse(warehouseId),
      total: outputs.length,
      outputs,
    });
  } catch (error) {
    next(error);
  }
};

export const registerOutput = async (req, res, next) => {
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

    const { productId, cantidad, motivo } = req.body;

    if (!isValidObjectId(productId)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findById(productId);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const stock = await decreaseStock(productId, warehouseId, cantidad);

    if (!stock) {
      return errorResponse(res, 400, 'Existencia insuficiente para la salida', 'INSUFFICIENT_STOCK');
    }

    const output = await Output.create({
      productId,
      warehouseId,
      cantidad,
      motivo,
      registradoPor: getAuditUser(req),
    });

    const stockMap = await getStockMapForWarehouse(warehouseId, [productId]);
    const [enriched] = attachWarehouseStock([product], stockMap, warehouseId);

    return successResponse(res, 201, 'Salida registrada correctamente', {
      output,
      product: enriched,
      warehouse: { _id: warehouse._id, nombre: warehouse.nombre },
    });
  } catch (error) {
    next(error);
  }
};
