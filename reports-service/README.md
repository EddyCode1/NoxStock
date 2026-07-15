# Servicio de Alertas y Reportes - NoxStock

## Descripción
Este servicio implementa lógica independiente para generar alertas y reportes utilizando la información del inventario. Consume información del Servicio A mediante HTTP y protege toda su API con JWT.

En desarrollo integrado consume `inventory-service` en tiempo real. Los mocks solo se activan si configuras `USE_MOCK_INVENTORY=true` o `ALLOW_MOCK_FALLBACK=true`.

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
JWT_SECRET=noxstock_jwt_secret_dev_2026
NODE_ENV=development
INVENTORY_SERVICE_URL=http://localhost:3002
LOW_STOCK_THRESHOLD=5
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=8000
USE_MOCK_INVENTORY=false
ALLOW_MOCK_FALLBACK=false
ALLOW_DEV_TOKEN=false
```

### Modo de prueba local

- `USE_MOCK_INVENTORY=true` fuerza datos mock sin llamar al inventario.
- `ALLOW_MOCK_FALLBACK=true` usa mock solo si inventory-service no responde.
- `ALLOW_DEV_TOKEN=true` habilita `GET /dev/token` para generar un JWT de prueba.
- En el monorepo integrado deja ambos en `false` para datos reales.

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
- Si inventory-service no está disponible y los mocks están desactivados, los endpoints devuelven error explícito
