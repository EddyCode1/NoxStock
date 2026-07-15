# NoxStock Backend - Sistema de Gestión de Inventario

## 📋 Descripción General

NoxStock es un sistema modular de gestión de inventario compuesto por 3 servicios independientes desarrollados en Node.js:

1. **Servicio de Autenticación** (Auth Service) - Puerto 3001
2. **Servicio de Gestión de Inventario** (Inventory Service) - Puerto 3002
3. **Servicio de Alertas y Reportes** (Reports Service) - Puerto 3003

## 🏗️ Arquitectura del Proyecto

```
services/
├── auth-service/              # Servicio de Autenticación
│   ├── config/               # Configuración de BD
│   ├── models/               # Esquemas Mongoose
│   ├── routes/               # Rutas de API
│   ├── controllers/          # Lógica de negocio
│   ├── middlewares/          # Middlewares custom
│   ├── helpers/              # Funciones auxiliares
│   ├── index.js              # Entrada del servicio
│   ├── package.json
│   └── .env.example
│
├── inventory-service/        # Servicio de Inventario
│   ├── config/               # Configuración de BD
│   ├── models/               # Esquemas Mongoose
│   ├── routes/               # Rutas de API
│   ├── controllers/          # Lógica de negocio
│   ├── middlewares/          # Middlewares custom
│   ├── helpers/              # Funciones auxiliares
│   ├── index.js              # Entrada del servicio
│   ├── package.json
│   └── .env.example
│
└── reports-service/          # Servicio de Reportes
    ├── routes/               # Rutas de API
    ├── controllers/          # Lógica de negocio
    ├── services/             # Servicios HTTP
    ├── middlewares/          # Middlewares custom
    ├── helpers/              # Funciones auxiliares
    ├── index.js              # Entrada del servicio
    ├── package.json
    └── .env.example
```

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js (v16 o superior)
- MongoDB (local o en nube)
- PNPM (package manager)

### Instalación

#### 1. Servicio de Autenticación

```bash
cd services/auth-service
cp .env.example .env
# Editar .env con configuración local
pnpm install
pnpm dev
```

**Prueba:** `curl http://localhost:3001/health`

#### 2. Servicio de Inventario

```bash
cd services/inventory-service
cp .env.example .env
# Editar .env con configuración local
pnpm install
pnpm dev
```

**Prueba:** `curl http://localhost:3002/health`

#### 3. Servicio de Reportes

```bash
cd services/reports-service
cp .env.example .env
# Editar .env con configuración local
pnpm install
pnpm dev
```

**Prueba:** `curl http://localhost:3003/health`

## 📦 Cada Servicio Incluye

### Auth Service - `services/auth-service/`

**Endpoints:**
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

**Modelo Usuario:**
```javascript
{
  nombre: String,
  email: String (único),
  password: String (cifrada con bcrypt)
}
```

**Variables de Entorno (.env):**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/noxstock-auth
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
NODE_ENV=development
```

---

### Inventory Service - `services/inventory-service/`

**Endpoints:**
- `GET /products` - Listar todos los productos
- `GET /products/:id` - Obtener un producto
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto
- `GET /categories` - Listar categorías
- `POST /entries` - Registrar entrada de inventario
- `POST /outputs` - Registrar salida de inventario

**Modelo Producto:**
```javascript
{
  nombre: String,
  categoría: String,
  precio: Number,
  existencia: Number,
  // campos adicionales según necesidad
}
```

**Variables de Entorno (.env):**
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/noxstock-inventory
JWT_SECRET=your_secret_key
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
```

---

### Reports Service - `services/reports-service/`

**Endpoints:**
- `GET /alerts/low-stock` - Productos con bajo inventario
- `GET /alerts/out-of-stock` - Productos agotados
- `GET /reports/top-products` - Productos más vendidos
- `GET /reports/categories` - Resumen por categoría
- `GET /reports/summary` - Reporte general

**Variables de Entorno (.env):**
```
PORT=3003
JWT_SECRET=your_secret_key
NODE_ENV=development
INVENTORY_SERVICE_URL=http://localhost:3002
LOW_STOCK_THRESHOLD=5
```

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro:** El usuario se registra en el endpoint `/auth/register`
2. **Login:** El usuario inicia sesión y recibe un JWT
3. **Protección:** El JWT se envía en el header `Authorization: Bearer {token}` para acceder a endpoints protegidos
4. **Validación:** Los middlewares en cada servicio validan el JWT

### Ejemplo de Solicitud Protegida

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:3002/products
```

---

## 📝 Próximos Pasos para Desarrolladores

### 1. Completar Auth Service

- [ ] Crear modelo de Usuario en `models/User.js`
- [ ] Implementar rutas en `routes/auth.js`
- [ ] Implementar controladores en `controllers/authController.js`
- [ ] Crear middleware de autenticación en `middlewares/auth.js`
- [ ] Validar contraseñas con bcryptjs

### 2. Completar Inventory Service

- [ ] Crear modelos: Product, Category, Entry, Output
- [ ] Implementar rutas para cada recurso
- [ ] Implementar controladores
- [ ] Crear middleware para validar JWT
- [ ] Implementar lógica de actualización automática de existencias

### 3. Completar Reports Service

- [ ] Implementar cliente HTTP para consultar Inventory Service
- [ ] Crear controladores de alertas
- [ ] Crear controladores de reportes
- [ ] Implementar cálculos de productos más vendidos
- [ ] Configurar umbral de bajo inventario

### 4. Frontend (React)

- [ ] Componentes de autenticación (Login, Register)
- [ ] Gestión de estado con Zustand para el JWT
- [ ] Dashboard de inventario
- [ ] CRUD de productos
- [ ] Registro de entradas/salidas
- [ ] Panel de alertas y reportes

---

## 🛠️ Configuración de MongoDB

### Local (Docker)

```bash
docker run -d -p 27017:27017 --name noxstock-mongo \
  -e MONGO_INITDB_DATABASE=noxstock-auth \
  mongo:latest
```

### Variables de conexión por servicio

Cada servicio debe conectarse a su propia BD o compartir la instancia:

```
noxstock-auth        # Auth Service
noxstock-inventory   # Inventory Service
```

---

## 📚 Estructura de Carpetas por Servicio

### config/
- Configuración de base de datos
- Variables globales

### models/
- Esquemas de Mongoose
- Validaciones de datos

### routes/
- Definición de rutas
- Asociación con controladores

### controllers/
- Lógica de negocio
- Respuestas HTTP

### middlewares/
- Validación de JWT
- Manejo de errores
- Logs

### helpers/
- Funciones auxiliares
- Utilidades compartidas

---

## 🧪 Pruebas de Endpoints

### Con Postman o cURL

#### Registrar Usuario

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "email": "juan@example.com",
    "password": "SecurePass123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123"
  }'
```

#### Crear Producto (requiere JWT)

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "nombre": "Laptop",
    "categoría": "Electrónica",
    "precio": 800,
    "existencia": 10
  }'
```

---

## 🐳 Docker Compose

Para levantar todos los servicios a la vez:

```yaml
# docker-compose.yml (en raíz del proyecto)
version: '3.8'

services:
  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGODB_URI=mongodb://mongo:27017/noxstock-auth

  inventory-service:
    build: ./services/inventory-service
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - MONGODB_URI=mongodb://mongo:27017/noxstock-inventory

  reports-service:
    build: ./services/reports-service
    ports:
      - "3003:3003"
    environment:
      - PORT=3003

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 🤝 Convenciones de Código

- Usar ESM (ES Modules)
- Estructura consistente en rutas y controladores
- Manejo de errores centralizado
- Variables de entorno para configuración
- Comentarios en código complejo

---

## 📞 Puertos por Servicio

| Servicio | Puerto | Endpoint |
|----------|--------|----------|
| Autenticación | 3001 | http://localhost:3001 |
| Inventario | 3002 | http://localhost:3002 |
| Reportes | 3003 | http://localhost:3003 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## ✅ Checklist para Empezar

- [ ] Clonar/descargar repositorio
- [ ] Crear archivo `.env` en cada servicio
- [ ] Instalar MongoDB (local o nube)
- [ ] Ejecutar `pnpm install` en cada servicio
- [ ] Ejecutar `pnpm dev` en cada servicio
- [ ] Verificar endpoints con `/health`
- [ ] Implementar modelos y controladores
- [ ] Conectar frontend con servicios
- [ ] Pruebas de integración

---

**¡El proyecto está listo para que los desarrolladores comiencen a trabajar!**
