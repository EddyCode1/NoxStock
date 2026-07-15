# Servicio de Alertas y Reportes - NoxStock

## Descripción
Este servicio implementa lógica independiente para generar reportes e indicadores utilizando la información del inventario. Consume información del Servicio de Inventario mediante HTTP cuando es necesario.

## Funcionalidades
- Mostrar productos con bajo inventario
- Mostrar productos agotados
- Mostrar los productos más vendidos (según las salidas registradas)
- Mostrar un resumen del inventario por categoría
- Generar un reporte general del inventario

## Endpoints Mínimos

### Alertas
- `GET /alerts/low-stock` - Productos con bajo inventario
- `GET /alerts/out-of-stock` - Productos agotados

### Reportes
- `GET /reports/top-products` - Productos más vendidos
- `GET /reports/categories` - Resumen por categoría
- `GET /reports/summary` - Reporte general del inventario

## Variables de Entorno

Crear un archivo `.env` en la raíz del servicio:

```
PORT=3003
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
INVENTORY_SERVICE_URL=http://localhost:3002
LOW_STOCK_THRESHOLD=5
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
reports-service/
├── index.js           # Punto de entrada
├── package.json
├── .env
├── routes/
│   ├── alerts.js      # Rutas de alertas
│   └── reports.js     # Rutas de reportes
├── controllers/
│   ├── alertController.js
│   └── reportController.js
├── services/
│   └── inventoryClient.js  # Cliente HTTP para el servicio de inventario
├── middlewares/
│   └── auth.js        # Middleware de autenticación
└── helpers/
    └── validateJwt.js # Utilidades de validación JWT
```

## Notas
- Todos los endpoints requieren un JWT válido
- El criterio para bajo inventario es configurable (por defecto 5 unidades)
- Este servicio consulta el Servicio de Inventario en lugar de mantener su propia base de datos
