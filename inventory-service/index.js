import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import entryRoutes from './routes/entries.js';
import outputRoutes from './routes/outputs.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { successResponse } from './helpers/response.js';
import { seedInventory } from './seed/seedInventory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  return successResponse(res, 200, 'Inventory Service is running', {
    service: 'inventory-service',
    port: PORT,
  });
});

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/entries', entryRoutes);
app.use('/outputs', outputRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await seedInventory();

    app.listen(PORT, () => {
      console.log(`✅ Servicio de Inventario escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servicio de inventario:', error.message);
    process.exit(1);
  }
};

startServer();
