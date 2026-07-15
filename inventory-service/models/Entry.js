import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
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

entrySchema.index({ productId: 1, fecha: -1 });

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
