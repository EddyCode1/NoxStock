import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre no puede superar 120 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categor├¡a es obligatoria'],
      trim: true,
      maxlength: [80, 'La categor├¡a no puede superar 80 caracteres'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    existencia: {
      type: Number,
      required: [true, 'La existencia es obligatoria'],
      min: [0, 'La existencia no puede ser negativa'],
      default: 0,
    },
    stockMinimo: {
      type: Number,
      min: [0, 'El stock m├¡nimo no puede ser negativo'],
      default: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ nombre: 1 });
productSchema.index({ categoria: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
