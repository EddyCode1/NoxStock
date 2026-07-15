import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema(
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

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'El proveedor es obligatorio'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'La bodega es obligatoria'],
    },
    items: {
      type: [purchaseOrderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'La orden debe tener al menos un producto',
      },
    },
    estado: {
      type: String,
      enum: ['borrador', 'enviada', 'recibida', 'cancelada'],
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
    fechaEnvio: Date,
    fechaRecepcion: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

purchaseOrderSchema.index({ supplierId: 1, estado: 1, createdAt: -1 });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
