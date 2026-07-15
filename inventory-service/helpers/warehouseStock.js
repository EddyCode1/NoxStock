import Product from '../models/Product.js';
import WarehouseStock from '../models/WarehouseStock.js';
import { getBranchWarehouseIds } from './warehouseContext.js';

export const getCatalogProductIds = async (warehouseId) => {
  const stocks = await WarehouseStock.find({ warehouseId }).select('productId');
  return stocks.map((item) => item.productId);
};

export const getAllBranchCatalogProductIds = async () => {
  const branchIds = await getBranchWarehouseIds();
  const stocks = await WarehouseStock.find({ warehouseId: { $in: branchIds } }).select('productId');
  return [...new Set(stocks.map((item) => String(item.productId)))];
};

export const getAggregatedStockMap = async (productIds = []) => {
  const branchIds = await getBranchWarehouseIds();
  const filter = { warehouseId: { $in: branchIds } };

  if (productIds.length > 0) {
    filter.productId = { $in: productIds };
  }

  const stocks = await WarehouseStock.find(filter);
  const stockMap = new Map();

  for (const item of stocks) {
    const key = String(item.productId);
    stockMap.set(key, (stockMap.get(key) || 0) + item.existencia);
  }

  return stockMap;
};

export const isProductInWarehouseCatalog = async (productId, warehouseId) => {
  const stock = await WarehouseStock.findOne({ productId, warehouseId }).select('_id');
  return Boolean(stock);
};

export const isProductInAnyBranchCatalog = async (productId) => {
  const branchIds = await getBranchWarehouseIds();
  const stock = await WarehouseStock.findOne({
    productId,
    warehouseId: { $in: branchIds },
  }).select('_id');

  return Boolean(stock);
};

export const syncProductTotal = async (productId) => {
  const stocks = await WarehouseStock.find({ productId });
  const total = stocks.reduce((sum, item) => sum + item.existencia, 0);

  await Product.findByIdAndUpdate(productId, { existencia: total }, { runValidators: true });

  return total;
};

export const getStockMapForWarehouse = async (warehouseId, productIds = []) => {
  const filter = { warehouseId };

  if (productIds.length > 0) {
    filter.productId = { $in: productIds };
  }

  const stocks = await WarehouseStock.find(filter);
  return new Map(stocks.map((item) => [String(item.productId), item.existencia]));
};

export const attachWarehouseStock = (products, stockMap, warehouseId) =>
  products.map((product) => {
    const plain = product.toObject ? product.toObject() : { ...product };
    const existencia = stockMap.get(String(plain._id)) ?? 0;

    return {
      ...plain,
      existencia,
      warehouseId,
    };
  });

export const ensureWarehouseStock = async (productId, warehouseId, existencia = 0) => {
  return WarehouseStock.findOneAndUpdate(
    { productId, warehouseId },
    { $setOnInsert: { productId, warehouseId, existencia } },
    { new: true, upsert: true, runValidators: true }
  );
};
