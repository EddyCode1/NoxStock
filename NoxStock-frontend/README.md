# 🏪 NoxStock Frontend - Sistema de Gestión de Inventario

**React + Vite** - Interfaz moderna para el sistema de gestión de inventario NoxStock

## 📋 Requisitos

- Node.js 18+
- pnpm 10.29.3+

## 🚀 Instalación y Setup

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Editar `.env.local` con las URLs de los servicios:

```env
# Servicios Backend
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_INVENTORY_SERVICE_URL=http://localhost:3002
VITE_REPORTS_SERVICE_URL=http://localhost:3003

VITE_APP_NAME=NoxStock
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## 💻 Desarrollo

### Iniciar servidor de desarrollo
```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:5173`

## 🔨 Compilación

### Build para producción
```bash
pnpm build
```

### Preview de producción
```bash
pnpm preview
```

## 📦 Stack Tecnológico

- **React** 19.2.4 - Librería UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Zustand** - State management
- **Axios** - Cliente HTTP
- **React Hook Form** - Gestión de formularios
- **Tailwind CSS** - Estilos
- **React Hot Toast** - Notificaciones
- **XLSX** - Exportación de reportes
- **jsPDF** - Generación de PDFs

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # Componentes y lógica principal
├── features/               # Funcionalidades (módulos)
│   ├── auth/              # Autenticación
│   ├── products/          # Gestión de productos
│   ├── inventory/         # Operaciones de inventario
│   └── reports/           # Reportes y alertas
├── shared/                # Componentes compartidos
│   ├── components/        # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── api/              # Clientes HTTP
│   └── utils/            # Funciones auxiliares
├── styles/                # Estilos globales
└── main.jsx              # Punto de entrada
```

## 🔐 Autenticación

### Flujo de Autenticación

1. Usuario se registra o inicia sesión en el Auth Service
2. Recibe un JWT que se almacena localmente
3. El JWT se envía en todas las solicitudes a servicios protegidos
4. Los servicios validan el JWT

### Gestión del JWT

- Se almacena en **localStorage** o **sessionStorage**
- Se envía en header `Authorization: Bearer {token}`
- Se refresca automáticamente cuando sea necesario

## 📱 Funcionalidades Principales

### 🔐 Autenticación
- [x] Registro de usuario
- [x] Inicio de sesión
- [x] Cierre de sesión
- [x] Recuperación de contraseña (opcional)

### 📦 Gestión de Inventario
- [x] Vista de todos los productos
- [x] Crear nuevo producto
- [x] Editar producto existente
- [x] Eliminar producto
- [x] Buscar producto por nombre/categoría
- [x] Gestión de categorías

### 📥📤 Movimientos de Inventario
- [x] Registrar entrada de inventario
- [x] Registrar salida de inventario
- [x] Historial de movimientos
- [x] Actualización automática de stock

### 📊 Reportes y Alertas
- [x] Dashboard de alertas
  - Productos con bajo inventario
  - Productos agotados
- [x] Reporte de productos más vendidos
- [x] Resumen por categoría
- [x] Reporte general del inventario
- [x] Exportar reportes (PDF, Excel)

### 🎨 Interfaz
- [x] Tema responsive
- [x] Navegación intuitiva
- [x] Notificaciones (toast)
- [x] Validación de formularios
- [x] Carga y error states

## 🌐 Integración con Backend

### Servicios HTTP

#### Auth Service (Puerto 3001)
```javascript
POST /auth/register
POST /auth/login
```

#### Inventory Service (Puerto 3002)
```javascript
GET /products
POST /products
PUT /products/:id
DELETE /products/:id
GET /categories
POST /entries
POST /outputs
```

#### Reports Service (Puerto 3003)
```javascript
GET /alerts/low-stock
GET /alerts/out-of-stock
GET /reports/top-products
GET /reports/categories
GET /reports/summary
```

## 🧪 Testing

Todos los endpoints requieren validación en frontend:

- Campos requeridos
- Formatos válidos
- Valores positivos para cantidades
- Autorización JWT

## 📝 Scripts Disponibles

```bash
pnpm dev          # Desarrollo
pnpm build        # Build producción
pnpm preview      # Preview local del build
pnpm lint         # Linting con ESLint
```

## 🤝 Convenciones de Código

- **Nombres de componentes:** PascalCase
- **Variables y funciones:** camelCase
- **Props:** PropTypes o TypeScript
- **Estilos:** Tailwind CSS classes
- **Rutas:** React Router v7

## 📚 Estructura de Componentes

### Componentes de Página
```
src/app/
├── LoginPage.jsx
├── DashboardPage.jsx
├── ProductsPage.jsx
├── InventoryPage.jsx
└── ReportsPage.jsx
```

### Componentes Compartidos
```
src/shared/components/
├── Navbar.jsx
├── Sidebar.jsx
├── Card.jsx
├── Modal.jsx
├── Button.jsx
└── FormInput.jsx
```

## 🚀 Deploy

### Deploy en Vercel

```bash
# Conectar con Vercel
vercel

# Deploy
vercel --prod
```

### Deploy en Netlify

```bash
# Build
pnpm build

# Deploy carpeta dist
netlify deploy --prod --dir=dist
```

## 🐛 Troubleshooting

### CORS Errors
- Asegúrate que los servicios backend tienen CORS habilitado
- Verifica las URLs en `.env.local`

### JWT Expirado
- Se debe implementar refresh token
- O redirigir a login automáticamente

### Variables de entorno no se cargan
- Reinicia el servidor de desarrollo
- Verifica que el archivo `.env.local` existe
- Variables deben empezar con `VITE_`

## 📞 Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend (Vite) | 5173 |
| Auth Service | 3001 |
| Inventory Service | 3002 |
| Reports Service | 3003 |

## ✅ Checklist de Desarrollo

- [ ] Clonado repositorio
- [ ] Instaladas dependencias
- [ ] Configurado `.env.local`
- [ ] Servicios backend corriendo
- [ ] Frontend iniciado en puerto 5173
- [ ] Autenticación funcionando
- [ ] Productos CRUD funcionando
- [ ] Reportes mostrando datos
- [ ] Formularios validando
- [ ] Estilos aplicados correctamente

---

**¡Listo para comenzar a desarrollar! 🚀**

El frontend se abrirá en `http://localhost:5173`

### Compilación
```bash
pnpm build
```

### Preview de producción
```bash
pnpm preview
```

### Linting
```bash
pnpm lint
```

## 🔗 Conectar con Backend

El frontend está configurado para conectarse al backend en:
- **Desarrollo**: `http://localhost:3000`
- **Staging**: `https://api-staging.tudominio.com`
- **Producción**: `https://api.tudominio.com`

### Proxy automático en desarrollo
Vite incluye un proxy que redirige llamadas a `/GestorRestaurante/*` al backend.

### En producción
La API debe servirse desde el mismo dominio o tener CORS configurado correctamente en el backend.

## 📦 Dependencias principales

- **React** 19.2.4
- **React Router DOM** 7.14.0
- **Vite** 8.0.4
- **Tailwind CSS** 4.2.2
- **Axios** 1.15.0
- **React Hook Form** 7.72.1
- **React Hot Toast** 2.6.0
- **Zustand** 5.0.12

## 🌍 Estructura del proyecto

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── App.jsx
├── .env.example
├── .env.local
├── .env.staging
├── .env.production
├── vite.config.js
└── package.json
```

## 🐳 Usar con Docker

Ver `docker-compose.yml` en el repositorio principal.

## 📝 Licencia

ISC
