import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import { runAuthSeeds } from './seed/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Auth Service is running',
    service: 'auth-service',
    port: PORT,
  });
});

app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await runAuthSeeds();

    app.listen(PORT, () => {
      console.log(`✅ Servicio de Autenticación escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar auth-service:', error.message);
    process.exit(1);
  }
};

startServer();
