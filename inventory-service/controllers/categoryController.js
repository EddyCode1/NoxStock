import Product from '../models/Product.js';
import {
  isCentralWarehouse,
  resolveWarehouseId,
} from '../helpers/warehouseContext.js';
import {
  getAllBranchCatalogProductIds,
  getCatalogProductIds,
} from '../helpers/warehouseStock.js';
import { successResponse } from '../helpers/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const warehouseId = resolveWarehouseId(req);
    const filter = {};

    if (warehouseId) {
      const centralView = await isCentralWarehouse(warehouseId);
      const catalogProductIds = centralView
        ? await getAllBranchCatalogProductIds()
        : await getCatalogProductIds(warehouseId);

      if (catalogProductIds.length === 0) {
        return successResponse(res, 200, 'Categorías obtenidas correctamente', {
          warehouseId,
          vistaConsolidada: centralView,
          total: 0,
          categories: [],
        });
      }

      filter._id = { $in: catalogProductIds };
    }

    const categories = await Product.distinct('categoria', filter);

    return successResponse(res, 200, 'Categorías obtenidas correctamente', {
      warehouseId: warehouseId || null,
      vistaConsolidada: warehouseId ? await isCentralWarehouse(warehouseId) : false,
      total: categories.length,
      categories: categories.sort((a, b) => a.localeCompare(b, 'es')),
    });
  } catch (error) {
    next(error);
  }
};
