import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEAM_EMAILS = [
  'admin@noxstock.com',
  'kevin@noxstock.com',
  'eddy@noxstock.com',
  'sajche@noxstock.com',
  'ana@noxstock.com',
  'luis@noxstock.com',
  'maria@noxstock.com',
  'carlos@noxstock.com',
  'sofia@noxstock.com',
  'pedro@noxstock.com',
];

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || '1234';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || DEFAULT_PASSWORD;

const syncPasswords = async () => {
  await connectDB();

  let updated = 0;

  for (const email of TEAM_EMAILS) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.warn(`[syncPasswords] Usuario no encontrado: ${email}`);
      continue;
    }

    user.password = email === 'admin@noxstock.com' ? MASTER_PASSWORD : DEFAULT_PASSWORD;
    user.activo = true;
    await user.save();
    updated += 1;
    console.log(`[syncPasswords] ${email} → contraseña actualizada`);
  }

  const total = await User.countDocuments();
  console.log(`[syncPasswords] Listo: ${updated} usuarios del equipo, ${total} en total en la base`);
  process.exit(0);
};

syncPasswords().catch((error) => {
  console.error('[syncPasswords] Error:', error.message);
  process.exit(1);
});
