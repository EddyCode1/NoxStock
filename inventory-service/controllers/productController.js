import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import {
  attachWarehouseStock,
  ensureWarehouseStock,
  getStockMapForWarehouse,
} from '../helpers/warehouseStock.js';
import {
  ensureWarehouseExists,
  requireWarehouseId,
} from '../helpers/warehouseContext.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getProducts = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    const { q, categoria } = req.query;
    const filter = {};

    if (q) {
      filter.nombre = { $regex: q.trim(), $options: 'i' };
    }

    if (categoria) {
      filter.categoria = { $regex: categoria.trim(), $options: 'i' };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    const stockMap = await getStockMapForWarehouse(
      warehouseId,
      products.map((product) => product._id)
    );
    const enriched = attachWarehouseStock(products, stockMap, warehouseId);

    if (req.query.bajoStock === 'true') {
      const lowStockProducts = enriched.filter((product) => {
        const minStock = product.stockMinimo ?? 5;
        return product.existencia > 0 && product.existencia <= minStock;
      });

      return successResponse(res, 200, 'Productos con bajo stock obtenidos correctamente', {
        warehouseId,
        warehouse: { _id: warehouse._id, nombre: warehouse.nombre },
        total: lowStockProducts.length,
        products: lowStockProducts,
      });
    }

    return successResponse(res, 200, 'Productos obtenidos correctamente', {
      warehouseId,
      warehouse: { _id: warehouse._id, nombre: warehouse.nombre },
      total: enriched.length,
      products: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const stockMap = await getStockMapForWarehouse(warehouseId, [product._id]);
    const [enriched] = attachWarehouseStock([product], stockMap, warehouseId);

    return successResponse(res, 200, 'Producto obtenido correctamente', { product: enriched });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    const { nombre, categoria, precio, existencia, stockMinimo } = req.body;
    const initialStock = existencia ?? 0;

    const product = await Product.create({
      nombre,
      categoria,
      precio,
      existencia: initialStock,
      stockMinimo: stockMinimo ?? 5,
    });

    await ensureWarehouseStock(product._id, warehouseId, initialStock);

    const [enriched] = attachWarehouseStock(
      [product],
      new Map([[String(product._id), initialStock]]),
      warehouseId
    );

    return successResponse(res, 201, 'Producto creado correctamente', { product: enriched });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const { nombre, categoria, precio, stockMinimo } = req.body;
    const updateData = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (precio !== undefined) updateData.precio = precio;
    if (stockMinimo !== undefined) updateData.stockMinimo = stockMinimo;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const stockMap = await getStockMapForWarehouse(warehouseId, [product._id]);
    const [enriched] = attachWarehouseStock([product], stockMap, warehouseId);

    return successResponse(res, 200, 'Producto actualizado correctamente', { product: enriched });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, 'ID de producto inválido', 'INVALID_ID');
    }

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    const [entriesCount, outputsCount] = await Promise.all([
      Entry.countDocuments({ productId: id }),
      Output.countDocuments({ productId: id }),
    ]);

    if (entriesCount > 0 || outputsCount > 0) {
      return errorResponse(
        res,
        409,
        'No se puede eliminar un producto con movimientos registrados',
        'PRODUCT_HAS_MOVEMENTS'
      );
    }

    await Product.findByIdAndDelete(id);

    return successResponse(res, 200, 'Producto eliminado correctamente', { product });
  } catch (error) {
    next(error);
  }
};
