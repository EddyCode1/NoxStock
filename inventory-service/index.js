import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import entryRoutes from './routes/entries.js';
import outputRoutes from './routes/outputs.js';
import supplierRoutes from './routes/suppliers.js';
import purchaseOrderRoutes from './routes/purchaseOrders.js';
import customerRoutes from './routes/customers.js';
import saleRoutes from './routes/sales.js';
import warehouseRoutes from './routes/warehouses.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { successResponse } from './helpers/response.js';
import { seedInventory } from './seed/seedInventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

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
app.use('/suppliers', supplierRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);
app.use('/customers', customerRoutes);
app.use('/sales', saleRoutes);
app.use('/warehouses', warehouseRoutes);

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
