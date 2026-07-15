import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import alertsRoutes from './routes/alerts.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'reports-service',
    timestamp: new Date().toISOString(),
    mockInventory: env.useMockInventory,
    devTokenEnabled: env.allowDevToken,
  });
});

app.get('/dev/token', (req, res) => {
  if (!env.allowDevToken) {
    return res.status(404).json({
      success: false,
      message: 'Ruta no disponible',
    });
  }

  const token = jwt.sign(
    {
      sub: 'dev-user',
      name: 'Usuario de pruebas',
      role: 'admin',
      roles: ['admin'],
      status: 'active',
      blocked: false,
    },
    env.jwtSecret,
    { expiresIn: '12h' }
  );

  return res.status(200).json({
    success: true,
    token,
    tokenType: 'Bearer',
    expiresIn: '12h',
  });
});

app.use('/alerts', alertsRoutes);
app.use('/reports', reportsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`✅ Servicio de Reportes y Alertas escuchando en puerto ${env.port}`);
});
