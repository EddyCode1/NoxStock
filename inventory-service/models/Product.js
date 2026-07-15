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
      required: [true, 'La categoría es obligatoria'],
      trim: true,
      maxlength: [80, 'La categoría no puede superar 80 caracteres'],
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
    lowStockThreshold: {
      type: Number,
      min: [0, 'El umbral no puede ser negativo'],
      default: null,
      description: 'Umbral personalizado de bajo stock. Si es null, usa el valor global.',
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
