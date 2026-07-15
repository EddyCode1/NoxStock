# Servicio de Alertas y Reportes - NoxStock

## Descripción
Este servicio implementa lógica independiente para generar alertas y reportes utilizando la información del inventario. Consume información del Servicio A mediante HTTP y protege toda su API con JWT.

En desarrollo, el servicio trae datos mock locales activados por defecto para que puedas probarlo aunque el Servicio A todavía no exista.

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
JWT_SECRET=dev-reports-secret
NODE_ENV=development
INVENTORY_SERVICE_URL=http://servicio-a-api/api
LOW_STOCK_THRESHOLD=5
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=8000
USE_MOCK_INVENTORY=true
ALLOW_MOCK_FALLBACK=true
ALLOW_DEV_TOKEN=true
```

### Modo de prueba local

- `USE_MOCK_INVENTORY=true` hace que los reportes usen datos locales.
- `ALLOW_DEV_TOKEN=true` habilita `GET /dev/token` para generar un JWT de prueba.
- Si luego conectas el Servicio A, basta con poner `USE_MOCK_INVENTORY=false`.

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
├── index.js
├── config/
│   └── env.js
├── controllers/
│   ├── alerts.controller.js
│   └── reports.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/
│   ├── alerts.routes.js
│   └── reports.routes.js
├── services/
│   └── inventory.service.js
└── utils/
        └── report.utils.js
```

## Contrato de Respuesta para `/reports/summary`

```json
{
    "success": true,
    "generatedAt": "2026-07-15T12:00:00.000Z",
    "data": {
        "inventory": {
            "totalProducts": 42,
            "totalCategories": 8,
            "totalUnitsInStock": 980,
            "totalEstimatedValue": 125430.5,
            "totalSoldUnits": 215
        },
        "alerts": {
            "lowStockCount": 6,
            "outOfStockCount": 2
        },
        "categories": [
            {
                "category": "Bebidas",
                "productCount": 10,
                "totalStock": 300,
                "estimatedValue": 8200
            }
        ],
        "topProducts": [
            {
                "productId": "65f...",
                "productName": "Refresco Cola",
                "soldUnits": 58,
                "movements": 12,
                "category": "Bebidas",
                "currentStock": 14,
                "price": 18.5
            }
        ]
    }
}
```

## Notas
- Todos los endpoints requieren un JWT válido en `Authorization: Bearer <token>`
- El criterio para bajo inventario es configurable (por defecto 5 unidades)
- Este servicio consulta el Servicio de Inventario en lugar de mantener su propia base de datos
- En desarrollo, los datos se sirven desde mocks locales si el Servicio A no está disponible
