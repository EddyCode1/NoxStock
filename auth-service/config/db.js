import mongoose from 'mongoose';

/**
 * Conecta a la base de datos MongoDB utilizando la URI definida en las
 * variables de entorno (MONGODB_URI).
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(uri);

    console.log('✅ Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
