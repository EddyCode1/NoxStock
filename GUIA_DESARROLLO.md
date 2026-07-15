# 🏪 NoxStock - Guía de Desarrollo

## Bienvenida al proyecto NoxStock

Este documento proporciona la guía completa para configurar, entender y comenzar a desarrollar en el sistema de gestión de inventario **NoxStock**.

---

## 📋 Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Estructura General](#estructura-general)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Configuración Inicial](#configuración-inicial)
5. [Iniciando los Servicios](#iniciando-los-servicios)
6. [Verificación de Instalación](#verificación-de-instalación)
7. [Próximos Pasos](#próximos-pasos)
8. [Recursos y Documentación](#recursos-y-documentación)

---

## 📌 Resumen del Proyecto

**NoxStock** es un sistema modular de gestión de inventario que consta de:

### 3 Servicios Backend (Node.js)
1. **Auth Service** - Autenticación y gestión de usuarios
2. **Inventory Service** - Gestión de productos y movimientos
3. **Reports Service** - Alertas y reportes del inventario

### 1 Frontend (React)
- Interfaz moderna y responsive para todos los servicios

**Todos los servicios operan de manera independiente pero coordinada**, permitiendo escalabilidad y mantenibilidad.

---

## 🗂️ Estructura General

```
NoxStock/
│
├── NoxStock-backend/
│   ├── services/
│   │   ├── auth-service/       ← Servicio de Autenticación (Puerto 3001)
│   │   ├── inventory-service/  ← Servicio de Inventario (Puerto 3002)
│   │   └── reports-service/    ← Servicio de Reportes (Puerto 3003)
│   ├── README.md               ← Guía del Backend
│   └── STRUCTURE.md            ← Documentación detallada
│
└── NoxStock-frontend/
    ├── src/
    ├── README.md               ← Guía del Frontend
    └── .env.example            ← Variables de ejemplo
```

---

## 🛠️ Requisitos del Sistema

### Software Requerido
- **Node.js** v16+ (v18+ recomendado)
- **PNPM** v10.29.3+
- **MongoDB** (local o en nube)
- **Git** (para versionamiento)

### Herramientas Recomendadas
- **Postman** o **Insomnia** (pruebas de API)
- **VS Code** (editor de código)
- **MongoDB Compass** (visualizador de BD)

### Instalación de Requisitos

#### Node.js y PNPM
```bash
# Descargar Node.js desde https://nodejs.org/ (LTS recomendado)
# Luego instalar PNPM
npm install -g pnpm@10.29.3

# Verificar instalación
node --version
pnpm --version
```

#### MongoDB
```bash
# Opción 1: Local con Docker
docker run -d -p 27017:27017 --name noxstock-mongo mongo:latest

# Opción 2: Usar MongoDB Atlas (en nube)
# Ir a https://www.mongodb.com/cloud/atlas
```

---

## ⚙️ Configuración Inicial

### Paso 1: Clonar/Descargar el Repositorio

```bash
# Si es un repositorio Git
git clone <URL_DEL_REPOSITORIO>
cd NoxStock

# O descargar el ZIP y extraer
```

### Paso 2: Estructura de Carpetas Creada

El proyecto ya tiene la siguiente estructura lista:

```
services/
├── auth-service/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   ├── helpers/
│   ├── package.json
│   ├── .env.example
│   └── index.js
├── inventory-service/
│   └── (misma estructura)
└── reports-service/
    └── (estructura adaptada)
```

---

## 🚀 Iniciando los Servicios

### Opción 1: Terminal por Servicio (Recomendado para desarrollo)

Abre **4 terminales** diferentes:

#### Terminal 1: Servicio de Autenticación

```bash
cd auth-service

# Configurar
cp .env.example .env

# Editar .env con tus valores
# MONGODB_URI=mongodb://localhost:27017/noxstock-auth
# JWT_SECRET=tu_clave_secreta_aqui
# NODE_ENV=development

# Instalar e iniciar
pnpm install
pnpm dev
```

**Resultado esperado:**
```
✅ Servicio de Autenticación escuchando en puerto 3001
```

#### Terminal 2: Servicio de Inventario

```bash
cd inventory-service

cp .env.example .env
# Editar .env

pnpm install
pnpm dev
```

**Resultado esperado:**
```
✅ Servicio de Inventario escuchando en puerto 3002
```

#### Terminal 3: Servicio de Reportes

```bash
cd reports-service

cp .env.example .env
# Editar .env

pnpm install
pnpm dev
```

**Resultado esperado:**
```
✅ Servicio de Reportes y Alertas escuchando en puerto 3003
```

#### Terminal 4: Frontend React

```bash
cd NoxStock-frontend

# Configurar
cp .env.example .env.local

# Editar .env.local si es necesario

# Instalar e iniciar
pnpm install
pnpm dev
```

**Resultado esperado:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Verificación de Instalación

### Paso 1: Verificar que MongoDB está corriendo

```bash
# Debería conectar sin errores
mongosh "mongodb://localhost:27017"

# Salir con Ctrl+C
```

### Paso 2: Verificar endpoints de salud

En una nueva terminal o con Postman, hacer requests a:

```bash
# Auth Service
curl http://localhost:3001/health

# Inventory Service
curl http://localhost:3002/health

# Reports Service
curl http://localhost:3003/health

# Frontend
curl http://localhost:5173
```

**Resultado esperado:** HTTP 200 con mensaje de estado

### Paso 3: Verificar conectividad desde el navegador

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver la página de login
3. Abre DevTools (F12) → Network para verificar conexiones

---

## 📝 Primeros Pasos de Desarrollo

### 1. Comenzar con Auth Service

**Objetivo:** Implementar autenticación básica

**Tareas:**
- [x] Crear modelo de Usuario en `models/User.js`
- [x] Configurar conexión a MongoDB en `config/db.js`
- [x] Implementar endpoints POST `/auth/register` y `/auth/login`
- [x] Cifrar contraseñas con bcryptjs
- [x] Generar y validar JWT
- [x] Probar con Postman

**Archivo de inicio:** `services/auth-service/index.js`

### 2. Continuar con Inventory Service

**Objetivo:** Gestión de productos e inventario

**Tareas:**
- [x] Crear modelos: Product, Entry, Output
- [x] Implementar CRUD de productos
- [x] Implementar endpoints de movimientos
- [x] Validar JWT en todos los endpoints
- [x] Actualizar automáticamente stock (atómico con `$inc`)
- [x] Probar endpoints

### 3. Completar Reports Service

**Objetivo:** Análisis e informes

**Tareas:**
- [x] Crear cliente HTTP para consultar Inventory Service
- [x] Implementar cálculo de bajo stock
- [x] Implementar reporte de productos agotados
- [x] Implementar top productos
- [x] Implementar resumen por categoría
- [x] Probar endpoints

### 4. Desarrollar Frontend

**Objetivo:** Interfaz de usuario completa

**Tareas:**
- [ ] Páginas de autenticación (login/registro)
- [ ] Dashboard principal
- [ ] CRUD de productos
- [ ] Registro de movimientos
- [ ] Panel de alertas
- [ ] Panel de reportes
- [ ] Diseño responsive con Tailwind

---

## 🔄 Flujo de Trabajo Típico

```
1. Developer clona repositorio
   ↓
2. Instala dependencias en cada servicio
   ↓
3. Configura archivos .env
   ↓
4. Inicia todos los servicios
   ↓
5. Abre aplicación en http://localhost:5173
   ↓
6. Prueba endpoints con Postman
   ↓
7. Implementa features según especificación
   ↓
8. Integra frontend con backend
   ↓
9. Testing y debugging
   ↓
10. Commit a Git
```

---

## 🧪 Ejemplo de Prueba de API

### Registrar Usuario

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "SecurePassword123"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "_id": "...",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePassword123"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "...",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Crear Producto (con JWT)

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nombre": "Laptop Dell",
    "categoría": "Electrónica",
    "precio": 800.00,
    "existencia": 15
  }'
```

---

## 📚 Recursos y Documentación

### Backend
- [README Backend](./NoxStock-backend/README.md)
- [STRUCTURE Backend](./NoxStock-backend/STRUCTURE.md)
- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/

### Frontend
- [README Frontend](./NoxStock-frontend/README.md)
- React: https://react.dev/
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- Tailwind CSS: https://tailwindcss.com/

### Herramientas
- Postman: https://www.postman.com/
- MongoDB Compass: https://www.mongodb.com/products/compass
- VS Code: https://code.visualstudio.com/

---

## ❓ Preguntas Frecuentes

### P: ¿Qué hacer si MongoDB no se conecta?
**R:** Verifica que:
- MongoDB está corriendo (`mongosh` debe conectar)
- La URL en `.env` es correcta
- No hay firewall bloqueando puerto 27017

### P: ¿Cómo cambiar el puerto de un servicio?
**R:** Edita la variable `PORT` en el archivo `.env` del servicio.

### P: ¿Cómo test los endpoints sin Postman?
**R:** Usa `curl` desde terminal o instala [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) en VS Code.

### P: ¿Dónde almaceno el JWT en el frontend?
**R:** En `localStorage` o `sessionStorage`, generalmente con Zustand/Context API.

### P: ¿Qué pasa si olvido el JWT_SECRET?
**R:** Crea uno aleatorio: `openssl rand -hex 32`

---

## 🎯 Próximos Pasos

1. **Ahora:** Instala las dependencias y inicia los servicios
2. **Luego:** Comienza con Auth Service
3. **Después:** Implementa Inventory Service
4. **Finalmente:** Completa Reports Service y Frontend

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en la terminal donde corre el servicio
2. Verifica archivos `.env`
3. Consulta documentación de STRUCTURE.md
4. Revisa GitHub Issues del repositorio

---

**¡Ahora sí! Todo está listo para comenzar. ¡Buena suerte! 🚀**
