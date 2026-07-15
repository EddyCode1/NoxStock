import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'El correo electrónico no tiene un formato válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No se retorna por defecto en las consultas
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Middleware pre-save: cifra la contraseña antes de guardarla
// Nota: mongoose v9+ soporta funciones async sin el parámetro "next";
// basta con retornar (o no) una promesa; cualquier error lanzado se propaga automáticamente.
userSchema.pre('save', async function () {
  // Solo cifrar si la contraseña fue modificada (evita re-cifrar en updates que no la tocan)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para comparar contraseñas
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

// Método para obtener la representación pública del usuario (sin password)
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    nombre: this.nombre,
    email: this.email,
    role: this.role,
    activo: this.activo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
