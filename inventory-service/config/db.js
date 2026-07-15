import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida en las variables de entorno');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log('MongoDB | conectado a noxstock-inventory');
  } catch (error) {
    console.error('MongoDB | error de conexión:', error.message);
    throw error;
  }
};
