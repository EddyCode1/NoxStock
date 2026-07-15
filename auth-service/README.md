# Servicio de Autenticación - NoxStock

## Descripción
Este es el servicio responsable de la autenticación de usuarios en el sistema NoxStock.

## Funcionalidades
- Registro de usuarios
- Verificación de correo electrónico (obligatoria antes de poder iniciar sesión)
- Reenvío de correo de verificación
- Inicio de sesión
- Recuperación de contraseña (forgot / reset password) vía correo electrónico
- Emisión de JWT (JSON Web Token)
- Validación de credenciales

> El flujo de verificación de email y recuperación de contraseña fue replicado
> a partir de la implementación de KinalSports (`auth-node`), adaptado al stack
> de NoxStock (Express + MongoDB/Mongoose) en lugar de Sequelize/PostgreSQL.

## Modelo Usuario
- nombre
- correo electrónico
- contraseña (cifrada con bcrypt)
- emailVerificado (booleano)
- tokenVerificacionEmail / tokenVerificacionEmailExpira
- tokenResetPassword / tokenResetPasswordExpira

## Endpoints

### POST /auth/register
Registrar un nuevo usuario. El usuario queda **inactivo** y con `emailVerificado: false`
hasta que confirme su correo electrónico. Se envía automáticamente un correo con el
enlace de verificación.

**Body:**
```json
{
  "nombre": "Juan",
  "email": "juan@example.com",
  "password": "SecurePassword123"
}
```

### POST /auth/verify-email
Verifica el correo electrónico usando el token recibido por correo. Al verificar,
el usuario queda activo y se envía un correo de bienvenida.

**Body:**
```json
{ "token": "eyJhbGciOi..." }
```

### POST /auth/resend-verification
Reenvía el correo de verificación si el usuario aún no ha verificado su cuenta.

**Body:**
```json
{ "email": "juan@example.com" }
```

### POST /auth/login
Iniciar sesión y obtener JWT. **Requiere que el correo ya esté verificado**,
de lo contrario responde `403` con `emailVerificationRequired: true`.

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

### POST /auth/forgot-password
Inicia el flujo de recuperación de contraseña. Siempre responde con éxito
(por seguridad), exista o no el correo, y envía un enlace con token de reset
si el usuario existe.

**Body:**
```json
{ "email": "juan@example.com" }
```

### POST /auth/reset-password
Restablece la contraseña usando el token recibido por correo.

**Body:**
```json
{ "token": "eyJhbGciOi...", "newPassword": "NuevaPassword123" }
```

### GET /auth/perfil
Ruta protegida que retorna el perfil del usuario autenticado (requiere `Authorization: Bearer <token>`).

## Variables de Entorno

Crear un archivo `.env` en la raíz del servicio:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/noxstock-auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development

# SMTP - Envío de correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=false
SMTP_USERNAME=kinalsports@gmail.com
SMTP_PASSWORD=koek doen egvt qcaz
EMAIL_FROM=kinalsports@gmail.com
EMAIL_FROM_NAME=NoxStock

# URL del frontend (para armar los links de verificación / reset)
FRONTEND_URL=http://localhost:5173

# Expiración de tokens (en horas)
VERIFICATION_EMAIL_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
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
│   ├── auth.js         # Middleware de autenticación
│   └── rateLimiter.js  # Rate limiting (auth / envío de correos)
└── helpers/
    ├── generateJwt.js     # Utilidades de JWT
    ├── tokenGenerator.js  # Generación de tokens seguros (verificación / reset)
    └── emailService.js    # Envío de correos (nodemailer)
```
