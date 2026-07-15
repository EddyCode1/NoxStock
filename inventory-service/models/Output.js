import mongoose from 'mongoose';

const outputSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'La bodega es obligatoria'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser mayor a 0'],
    },
    motivo: {
      type: String,
      trim: true,
      maxlength: [200, 'El motivo no puede superar 200 caracteres'],
      default: '',
    },
    registradoPor: {
      type: String,
      trim: true,
      default: '',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

outputSchema.index({ productId: 1, fecha: -1 });
outputSchema.index({ warehouseId: 1, fecha: -1 });

const Output = mongoose.model('Output', outputSchema);

export default Output;
