import User from '../models/User.js';

const DEFAULT_MASTER = {
  nombre: process.env.MASTER_NOMBRE || 'Administrador Maestro',
  email: process.env.MASTER_EMAIL || 'admin@noxstock.com',
  password: process.env.MASTER_PASSWORD || 'NoxStock2026!',
  role: 'admin',
};

export const seedMasterUser = async () => {
  const shouldSeed =
    process.env.SEED_MASTER_USER === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.SEED_MASTER_USER !== 'false');

  if (!shouldSeed) {
    return null;
  }

  const email = DEFAULT_MASTER.email.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`[auth-service] Usuario maestro ya existe: ${email}`);
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
