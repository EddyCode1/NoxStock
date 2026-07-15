import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser mayor a 0'],
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: [0, 'El precio unitario no puede ser negativo'],
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'El cliente es obligatorio'],
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'La venta debe tener al menos un producto',
      },
    },
    estado: {
      type: String,
      enum: ['borrador', 'confirmada', 'cancelada'],
      default: 'borrador',
    },
    notas: {
      type: String,
      trim: true,
      maxlength: [300, 'Las notas no pueden superar 300 caracteres'],
      default: '',
    },
    creadoPor: {
      type: String,
      trim: true,
      default: '',
    },
    fechaConfirmacion: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

saleSchema.index({ customerId: 1, estado: 1, createdAt: -1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
