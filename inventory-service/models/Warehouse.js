import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la bodega es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre no puede superar 120 caracteres'],
    },
    direccion: {
      type: String,
      trim: true,
      maxlength: [200, 'La dirección no puede superar 200 caracteres'],
      default: '',
    },
    lat: {
      type: Number,
      required: [true, 'La latitud es obligatoria'],
      min: [-90, 'Latitud inválida'],
      max: [90, 'Latitud inválida'],
    },
    lng: {
      type: Number,
      required: [true, 'La longitud es obligatoria'],
      min: [-180, 'Longitud inválida'],
      max: [180, 'Longitud inválida'],
    },
    activo: {
      type: Boolean,
      default: true,
    },
    esCentral: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

warehouseSchema.index({ nombre: 1 });
warehouseSchema.index({ lat: 1, lng: 1 });

warehouseSchema.virtual('hasLocation').get(function hasLocation() {
  return Number.isFinite(this.lat) && Number.isFinite(this.lng);
});

warehouseSchema.set('toJSON', { virtuals: true });
warehouseSchema.set('toObject', { virtuals: true });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
