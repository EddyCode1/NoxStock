# Servicio de Autenticación - NoxStock

## Descripción
Este es el servicio responsable de la autenticación de usuarios en el sistema NoxStock.

## Funcionalidades
- Registro de usuarios
- Inicio de sesión
- Emisión de JWT (JSON Web Token)
- Validación de credenciales

## Modelo Usuario
- nombre
- correo electrónico
- contraseña (cifrada con argon2 o bcrypt)

## Endpoints Mínimos

### POST /auth/register
Registrar un nuevo usuario

**Body:**
```json
{
  "nombre": "Juan",
  "email": "juan@example.com",
  "password": "SecurePassword123"
}
```

### POST /auth/login
Iniciar sesión y obtener JWT

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "...",
    "nombre": "Juan",
    "email": "juan@example.com"
  }
}
```

## Variables de Entorno

Crear un archivo `.env` en la raíz del servicio:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/noxstock-auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development
```

## Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Producción
pnpm start
```

## Estructura del Proyecto

```
auth-service/
├── index.js           # Punto de entrada
├── package.json
├── .env
├── config/
│   └── db.js          # Configuración de base de datos
├── models/
│   └── User.js        # Modelo de Usuario
├── routes/
│   └── auth.js        # Rutas de autenticación
├── controllers/
│   └── authController.js  # Controladores
├── middlewares/
│   └── auth.js        # Middleware de autenticación
└── helpers/
    └── generateJwt.js  # Utilidades de JWT
```
