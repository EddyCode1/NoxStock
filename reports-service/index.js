import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Reports Service is running' });
});

// TODO: Importar y usar rutas de reportes y alertas
// import alertRoutes from './routes/alerts.js';
// import reportRoutes from './routes/reports.js';
// app.use('/alerts', alertRoutes);
// app.use('/reports', reportRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servicio de Reportes y Alertas escuchando en puerto ${PORT}`);
});
