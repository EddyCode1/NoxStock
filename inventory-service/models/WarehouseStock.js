import mongoose from 'mongoose';

const warehouseStockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    existencia: {
      type: Number,
      required: true,
      min: [0, 'La existencia no puede ser negativa'],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

warehouseStockSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
warehouseStockSchema.index({ warehouseId: 1 });

const WarehouseStock = mongoose.model('WarehouseStock', warehouseStockSchema);

export default WarehouseStock;
