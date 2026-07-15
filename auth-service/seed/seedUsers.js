import User from '../models/User.js';
import { shouldRunSeed } from './seedUtils.js';

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || 'NoxStock2026!';

const USERS = [
  { nombre: 'Kevin Garcia', email: 'kevin@noxstock.com', role: 'user' },
  { nombre: 'Eddy Morales', email: 'eddy@noxstock.com', role: 'user' },
  { nombre: 'Sajche Lopez', email: 'sajche@noxstock.com', role: 'user' },
  { nombre: 'Ana Martinez', email: 'ana@noxstock.com', role: 'user' },
  { nombre: 'Luis Hernandez', email: 'luis@noxstock.com', role: 'user' },
  { nombre: 'Maria Lopez', email: 'maria@noxstock.com', role: 'user' },
  { nombre: 'Carlos Ruiz', email: 'carlos@noxstock.com', role: 'user' },
  { nombre: 'Sofia Diaz', email: 'sofia@noxstock.com', role: 'user' },
  { nombre: 'Pedro Ramirez', email: 'pedro@noxstock.com', role: 'user' },
];

export const seedUsers = async () => {
  if (!shouldRunSeed()) {
    return { created: 0, skipped: true };
  }

  let created = 0;

  for (const userData of USERS) {
    const email = userData.email.toLowerCase();
    const exists = await User.findOne({ email });

    if (exists) {
      continue;
    }

    await User.create({
      ...userData,
      email,
      password: DEFAULT_PASSWORD,
      activo: true,
    });

    created += 1;
  }

  const total = await User.countDocuments();
  console.log(`[auth-service] Usuarios en base de datos: ${total} (nuevos: ${created})`);

  return { created, total };
};

export default seedUsers;
