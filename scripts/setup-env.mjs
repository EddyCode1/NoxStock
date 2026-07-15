import { copyFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  ['auth-service/.env.example', 'auth-service/.env'],
  ['inventory-service/.env.example', 'inventory-service/.env'],
  ['reports-service/.env.example', 'reports-service/.env'],
  ['NoxStock-frontend/.env.example', 'NoxStock-frontend/.env.local'],
];

for (const [source, target] of files) {
  const sourcePath = resolve(root, source);
  const targetPath = resolve(root, target);

  if (!existsSync(sourcePath)) {
    console.warn(`[setup:env] No existe plantilla: ${source}`);
    continue;
  }

  if (existsSync(targetPath)) {
    console.log(`[setup:env] Ya existe: ${target}`);
    continue;
  }

  copyFileSync(sourcePath, targetPath);
  console.log(`[setup:env] Creado: ${target}`);
}

console.log('[setup:env] Listo');
