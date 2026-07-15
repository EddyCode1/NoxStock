# Servicio de Autenticación - NoxStock

## Descripción
Servicio de autenticación con registro, login, JWT y seeds de usuarios de prueba.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/health` | No | Estado del servicio |
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Iniciar sesión |
| `GET` | `/auth/perfil` | Sí | Perfil del usuario autenticado |

## Credenciales de prueba

| Email | Password | Rol |
|-------|----------|-----|
| `admin@noxstock.com` | `1234` | admin |
| `kevin@noxstock.com` | `1234` | user |
| `eddy@noxstock.com` | `1234` | user |
| `sajche@noxstock.com` | `1234` | user |

Se crean automáticamente al iniciar con `SEED_DATA=true`.

## Variables de entorno

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/noxstock-auth
JWT_SECRET=noxstock_jwt_secret_dev_2026
JWT_EXPIRE=24h
NODE_ENV=development
SEED_DATA=true
MASTER_EMAIL=admin@noxstock.com
MASTER_PASSWORD=1234
SEED_USER_PASSWORD=1234
```

**Importante:** `JWT_SECRET` debe ser el mismo en auth, inventory y reports.

## Ejemplo login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@noxstock.com\",\"password\":\"1234\"}"
```

## Instalación

```bash
pnpm install
pnpm dev   # desarrollo
pnpm start # producción
```

## Notas

- Contraseñas cifradas con **bcryptjs**
- Contraseña de prueba: 4–5 caracteres
- Rate limit en register/login (200 intentos en desarrollo)
- Al reiniciar, sincroniza password del usuario maestro
