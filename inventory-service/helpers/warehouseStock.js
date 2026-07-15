import Product from '../models/Product.js';
import WarehouseStock from '../models/WarehouseStock.js';

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
