import WarehouseStock from '../models/WarehouseStock.js';
import { syncProductTotal } from './warehouseStock.js';

export const increaseStock = async (productId, warehouseId, cantidad) => {
  const stock = await WarehouseStock.findOneAndUpdate(
    { productId, warehouseId },
    {
      $inc: { existencia: cantidad },
      $setOnInsert: { productId, warehouseId },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await syncProductTotal(productId);

  return stock;
};

export const decreaseStock = async (productId, warehouseId, cantidad) => {
  const stock = await WarehouseStock.findOneAndUpdate(
    { productId, warehouseId, existencia: { $gte: cantidad } },
    { $inc: { existencia: -cantidad } },
    { new: true, runValidators: true }
  );

  if (!stock) {
    return null;
  }

  await syncProductTotal(productId);

  return stock;
};

export const getWarehouseStock = async (productId, warehouseId) =>
  WarehouseStock.findOne({ productId, warehouseId });
