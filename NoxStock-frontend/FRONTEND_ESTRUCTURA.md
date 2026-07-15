# NoxStock Frontend - Estructura parcial

Servicio separado en `NoxStock-frontend/` (puerto 5173).

## Objetivo de esta fase

- Estructura de rutas y módulos
- Clientes HTTP hacia los 3 microservicios
- Vistas base sin diseño final (lo hará el equipo frontend)

## Servicios consumidos

| Variable | URL |
|----------|-----|
| `VITE_AUTH_SERVICE_URL` | http://localhost:3001 |
| `VITE_INVENTORY_SERVICE_URL` | http://localhost:3002 |
| `VITE_REPORTS_SERVICE_URL` | http://localhost:3003 |

## Vistas creadas (6 + auth)

| Ruta | Vista | Backend |
|------|-------|---------|
| `/login` | Login | auth-service |
| `/register` | Registro | auth-service |
| `/loby` | Dashboard | inventory + reports |
| `/loby/inventory` | Lista productos | inventory-service |
| `/loby/inventory/new` | Crear producto | inventory-service |
| `/loby/inventory/:id/edit` | Editar producto | inventory-service |
| `/loby/inventory/movements` | Entradas/salidas | inventory-service |
| `/loby/reports` | Reportes | reports-service |
| `/loby/alerts` | Alertas | reports-service |

## Estructura de carpetas

```
src/
├── app/
│   ├── components/NoxStockSidebar.jsx
│   ├── layouts/MainLayout.jsx
│   └── router/routes.jsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── inventory/
│   │   ├── hooks/useInventory.js
│   │   └── pages/
│   └── reports/
│       └── pages/
└── shared/api/
    ├── inventoryClient.js
    ├── reportsClient.js
    └── services/
        ├── inventoryService.js
        └── noxReportsService.js
```

## Credenciales de prueba

```
admin@noxstock.com / NoxStock2026!
```

## Nota sobre ft/zeta

No se mergeó `ft/zeta` completa porque eliminaba `reports-service` del backend y traía reportes de ventas con datos mock no relacionados al inventario.
