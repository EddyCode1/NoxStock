import Product from '../models/Product.js';

export const increaseStock = async (productId, cantidad) => {
  return Product.findOneAndUpdate(
    { _id: productId },
    { $inc: { existencia: cantidad } },
    { new: true, runValidators: true }
  );
};

export const decreaseStock = async (productId, cantidad) => {
  return Product.findOneAndUpdate(
    { _id: productId, existencia: { $gte: cantidad } },
    { $inc: { existencia: -cantidad } },
    { new: true, runValidators: true }
  );
};
