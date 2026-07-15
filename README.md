#  NoxStock - Sistema de Gestión de Inventario

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue)](#)

Un **sistema modular y escalable** de gestión de inventario compuesto por 3 servicios backend independientes (Node.js) y un frontend moderno (React).

## 🎯 Visión General

**NoxStock** es una solución empresarial para la gestión completa de inventario con:

- ✅ **Autenticación segura** con JWT
- ✅ **Gestión de productos** con categorías
- ✅ **Control de movimientos** (entradas/salidas)
- ✅ **Reportes inteligentes** con alertas automáticas
- ✅ **Interfaz moderna** y responsive
- ✅ **Arquitectura modular** y escalable

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
NoxStock/
│
├── 🔐 auth-service/                   # Autenticación (Puerto 3001)
├── 📦 inventory-service/              # Gestión de Inventario (Puerto 3002)
├── 📊 reports-service/                # Reportes y Alertas (Puerto 3003)
├── 🎨 NoxStock-frontend/              # Frontend React (Porto 5173)
├── � README.md                       # Guía principal
├── 📄 GUIA_DESARROLLO.md              # Guía de inicio (LEER PRIMERO)
├── 📄 PROYECTO_LIMPIEZA.md            # Estado del proyecto
├── 📄 BACKEND_STRUCTURE.md            # Arquitectura del backend
├── 📄 CAMBIOS_REALIZADOS.md           # Cambios realizados
├── 📄 REORGANIZACION.md               # Reorganización
├── docker-compose.yml                 # Compose para contenedores
├── Dockerfile                         # Configuración Docker
└── 📄 .gitignore
```

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** v16+ (v18+ recomendado)
- **PNPM** v10.29.3+ (o npm/yarn)
- **MongoDB** (local o en nube)
- **Git** (opcional)

### Instalación en 5 Pasos

#### 1. **Instalar Dependencias Globales**
```bash
npm install -g pnpm
```

#### 2. **Configurar MongoDB**
```bash
# Opción 1: Docker
docker run -d -p 27017:27017 --name noxstock-mongo mongo:latest

# Opción 2: Local o Atlas (https://www.mongodb.com/cloud/atlas)
```

#### 3. **Clonar el Repositorio**
```bash
git clone <URL_REPO>
cd NoxStock
```

#### 4. **Configurar y Iniciar Servicios**

Abre **4 terminales distintas** y ejecuta en cada una:

**Terminal 1 - Auth Service:**
```bash
cd auth-service
cp .env.example .env
pnpm install
pnpm dev
```

**Terminal 2 - Inventory Service:**
```bash
cd inventory-service
cp .env.example .env
pnpm install
pnpm dev
```

**Terminal 3 - Reports Service:**
```bash
cd reports-service
cp .env.example .env
pnpm install
pnpm dev
```

**Terminal 4 - Frontend:**
```bash
cd NoxStock-frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

#### 5. **Acceder a la Aplicación**
```
🌐 Frontend:  http://localhost:5173
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)** | 📖 **EMPEZAR AQUÍ** - Guía completa de inicio |
| **[PROYECTO_LIMPIEZA.md](./PROYECTO_LIMPIEZA.md)** | ✅ Estado y cambios realizados |
| **[NoxStock-backend/STRUCTURE.md](./NoxStock-backend/STRUCTURE.md)** | 🏗️ Arquitectura detallada del backend |
| **[NoxStock-backend/README.md](./NoxStock-backend/README.md)** | 📝 Documentación del backend |
| **[NoxStock-frontend/README.md](./NoxStock-frontend/README.md)** | 🎨 Documentación del frontend |

---

## 🔑 Puertos y URLs

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| **Auth Service** | 3001 | http://localhost:3001 | 🔐 Autenticación |
| **Inventory Service** | 3002 | http://localhost:3002 | 📦 Productos |
| **Reports Service** | 3003 | http://localhost:3003 | 📊 Reportes |
| **Frontend (React)** | 5173 | http://localhost:5173 | 🎨 UI |
| **MongoDB** | 27017 | mongodb://localhost:27017 | 🗄️ BD |

---

## 📦 Servicios Backend

### 🔐 Auth Service (Puerto 3001)

Responsable de la autenticación de usuarios.

**Funcionalidades:**
- Registro de usuarios
- Login con JWT
- Validación de credenciales
- Cifrado de contraseñas

**Endpoints:**
- `POST /auth/register`
- `POST /auth/login`

**Documentación:** [auth-service/README.md](./NoxStock-backend/services/auth-service/README.md)

### 📦 Inventory Service (Puerto 3002)

Gestión completa de productos e inventario.

**Funcionalidades:**
- CRUD de productos
- Gestión de categorías
- Registro de entradas/salidas
- Búsqueda por categoría
- Actualización automática de stock

**Endpoints:**
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto
- `GET /categories` - Listar categorías
- `POST /entries` - Registrar entrada
- `POST /outputs` - Registrar salida

**Documentación:** [inventory-service/README.md](./NoxStock-backend/services/inventory-service/README.md)

### 📊 Reports Service (Puerto 3003)

Análisis e inteligencia del inventario.

**Funcionalidades:**
- Alertas de bajo stock
- Productos agotados
- Productos más vendidos
- Resumen por categoría
- Reporte general

**Endpoints:**
- `GET /alerts/low-stock`
- `GET /alerts/out-of-stock`
- `GET /reports/top-products`
- `GET /reports/categories`
- `GET /reports/summary`

**Documentación:** [reports-service/README.md](./NoxStock-backend/services/reports-service/README.md)

---

## 🎨 Frontend (React)

Interfaz moderna para consumir los servicios backend.

**Stack Tecnológico:**
- React 19.x
- Vite
- React Router 7.x
- Zustand (State Management)
- Tailwind CSS
- Axios
- React Hook Form

**Funcionalidades:**
- Autenticación (Login/Registro)
- Dashboard de inventario
- CRUD de productos
- Registro de movimientos
- Panel de alertas
- Reportes con exportación

**Documentación:** [NoxStock-frontend/README.md](./NoxStock-frontend/README.md)

---

## 🔄 Flujo de Autenticación

```
1. Usuario se registra
   ↓
2. Usuario inicia sesión
   ↓
3. Recibe JWT
   ↓
4. JWT se envía en header: Authorization: Bearer {token}
   ↓
5. Servicios validan JWT
   ↓
6. Acceso a recursos protegidos
```

---

## 🧪 Prueba Rápida

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

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePassword123"
  }'
```

### Crear Producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "nombre": "Laptop Dell",
    "categoría": "Electrónica",
    "precio": 800,
    "existencia": 10
  }'
```

---

## 📋 Variables de Entorno

Cada servicio requiere un archivo `.env`. Usa `.env.example` como plantilla.

### Auth Service
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/noxstock-auth
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development
```

### Inventory Service
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/noxstock-inventory
JWT_SECRET=your_secret_key_here
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
```

### Reports Service
```env
PORT=3003
JWT_SECRET=your_secret_key_here
NODE_ENV=development
INVENTORY_SERVICE_URL=http://localhost:3002
LOW_STOCK_THRESHOLD=5
```

### Frontend
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_INVENTORY_SERVICE_URL=http://localhost:3002
VITE_REPORTS_SERVICE_URL=http://localhost:3003
VITE_APP_NAME=NoxStock
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Cifrado de contraseñas
- **CORS** - Soporte cross-origin

### Frontend
- **React** - Librería UI
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP

---

## 📊 Modelos de Datos

### Usuario (Auth Service)
```javascript
{
  _id: ObjectId,
  nombre: String,
  email: String (único),
  password: String (cifrada),
  createdAt: Date,
  updatedAt: Date
}
```

### Producto (Inventory Service)
```javascript
{
  _id: ObjectId,
  nombre: String,
  categoría: String,
  precio: Number,
  existencia: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Entrada de Inventario
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  cantidad: Number,
  fecha: Date,
  motivo: String
}
```

### Salida de Inventario
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  cantidad: Number,
  fecha: Date,
  motivo: String
}
```

---

## ✅ Checklist de Desarrollo

### Configuración Inicial
- [ ] Node.js v18+ instalado
- [ ] PNPM instalado
- [ ] MongoDB corriendo
- [ ] Repositorio clonado/descargado
- [ ] `.env` creados en cada servicio

### Backend
- [ ] Auth Service: Endpoints funcionando
- [ ] Inventory Service: CRUD funcionando
- [ ] Reports Service: Reportes funcionando
- [ ] JWT validando correctamente
- [ ] Errores siendo manejados

### Frontend
- [ ] Login/Registro funcionando
- [ ] Dashboard cargando
- [ ] CRUD de productos funcionando
- [ ] Reportes mostrando datos
- [ ] Estilos responsive

### Testing
- [ ] Endpoints probados con Postman
- [ ] Autenticación validada
- [ ] Movimientos de inventario probados
- [ ] Reportes correctos

---

## 🤝 Convenciones de Código

- **Nombres:** camelCase (variables/funciones), PascalCase (clases/componentes)
- **Archivos:** kebab-case para archivos, PascalCase para componentes React
- **Modelos:** Singular (User, Product, Entry)
- **Rutas:** RESTful con sustantivos (plural)
- **Métodos:** Verbos HTTP estándar (GET, POST, PUT, DELETE)
- **Respuestas:** JSON consistente con mensaje y datos

---

## 🐛 Troubleshooting

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
mongosh "mongodb://localhost:27017"

# Docker: verificar contenedor
docker ps | grep mongo
```

### Error CORS
- Verificar que `cors()` está en Express
- Confirmar URL del frontend en CORS whitelist

### JWT expirado
- Reducir `JWT_EXPIRE` en `.env`
- Implementar refresh token

### Puerto en uso
```bash
# Cambiar PORT en .env
PORT=3004  # Cambiar número
```

---

## 📞 Soporte y Contacto

Para problemas o preguntas:
1. Consulta [GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)
2. Revisa la documentación de cada servicio
3. Verifica logs en las terminales

---

## 📄 Licencia

ISC - Ver LICENSE para más detalles

---

## 🚀 Próximos Pasos

1. **Lee** [GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)
2. **Configura** variables de entorno
3. **Instala** dependencias
4. **Inicia** los servicios
5. **Desarrolla** según especificaciones

---

<div align="center">

###  ¡Bienvenido a NoxStock! 

**El sistema está listo. ¡Es hora de construir!**

[![Made with ](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-for%20inventory%20management-red)](https://github.com)

</div>

---

**Última actualización:** 15 de Julio de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ PRODUCCIÓN
