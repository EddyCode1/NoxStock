import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Inventory Service is running' });
});

// TODO: Importar y usar rutas de inventario
// import productRoutes from './routes/products.js';
// import categoryRoutes from './routes/categories.js';
// import entryRoutes from './routes/entries.js';
// import outputRoutes from './routes/outputs.js';
// app.use('/products', productRoutes);
// app.use('/categories', categoryRoutes);
// app.use('/entries', entryRoutes);
// app.use('/outputs', outputRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servicio de Inventario escuchando en puerto ${PORT}`);
});
