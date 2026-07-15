import User from '../models/User.js';
import { shouldRunSeed } from './seedUtils.js';

const DEFAULT_MASTER = {
  nombre: process.env.MASTER_NOMBRE || 'Administrador Maestro',
  email: process.env.MASTER_EMAIL || 'admin@noxstock.com',
  password: process.env.MASTER_PASSWORD || '1234',
  role: 'admin',
};

export const seedMasterUser = async () => {
  if (!shouldRunSeed()) {
    return null;
  }

  const email = DEFAULT_MASTER.email.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    existing.password = DEFAULT_MASTER.password;
    existing.activo = true;
    existing.role = DEFAULT_MASTER.role;
    await existing.save();
    console.log(`[auth-service] Usuario maestro sincronizado: ${email}`);
    return existing;
  }

  const masterUser = await User.create({
    nombre: DEFAULT_MASTER.nombre,
    email,
    password: DEFAULT_MASTER.password,
    role: DEFAULT_MASTER.role,
    activo: true,
  });

  console.log('[auth-service] Usuario maestro creado para pruebas');
  console.log(`[auth-service] Email: ${email}`);
  console.log(`[auth-service] Password: ${DEFAULT_MASTER.password}`);

  return masterUser;
};

export default seedMasterUser;
