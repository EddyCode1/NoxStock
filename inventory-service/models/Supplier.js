import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del proveedor es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre no puede superar 120 caracteres'],
    },
    contacto: {
      type: String,
      trim: true,
      maxlength: [100, 'El contacto no puede superar 100 caracteres'],
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [120, 'El email no puede superar 120 caracteres'],
      default: '',
    },
    telefono: {
      type: String,
      trim: true,
      maxlength: [30, 'El teléfono no puede superar 30 caracteres'],
      default: '',
    },
    categorias: {
      type: [String],
      default: [],
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

supplierSchema.index({ nombre: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
