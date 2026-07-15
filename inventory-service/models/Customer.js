import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre no puede superar 120 caracteres'],
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
    nit: {
      type: String,
      trim: true,
      maxlength: [20, 'El NIT no puede superar 20 caracteres'],
      default: '',
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

customerSchema.index({ nombre: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
