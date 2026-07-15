# Guía API Inventory Service → Frontend

Base URL: `http://localhost:3002`

## Autenticación (obligatoria)

Todos los endpoints excepto `/health` requieren:

```
Authorization: Bearer <JWT>
```

El JWT lo entrega `auth-service` en `POST /auth/login`.

---

## Backend NO tiene vistas

Este servicio solo expone **API REST**. El frontend debe crear las pantallas.

## Pantallas sugeridas para frontend (6 vistas)

| # | Vista / Pantalla | Endpoints que consume | Descripción |
|---|------------------|----------------------|-------------|
| 1 | **Lista de inventario** | `GET /products` | Tabla con todos los productos |
| 2 | **Buscar / filtrar** | `GET /products?q=` y `GET /products?categoria=` | Búsqueda por nombre o categoría |
| 3 | **Crear producto** | `POST /products` | Formulario modal o página |
| 4 | **Editar producto** | `GET /products/:id` + `PUT /products/:id` | Formulario de edición |
| 5 | **Registrar entrada** | `POST /entries` | Formulario: producto, cantidad, motivo |
| 6 | **Registrar salida** | `POST /outputs` | Formulario: producto, cantidad, motivo |

### Vistas opcionales recomendadas

| Vista | Endpoints | Uso |
|-------|-----------|-----|
| **Detalle de producto** | `GET /products/:id` | Ver stock actual y datos |
| **Historial de entradas** | `GET /entries` o `GET /entries?productId=` | Tabla de movimientos de entrada |
| **Historial de salidas** | `GET /outputs` o `GET /outputs?productId=` | Tabla de movimientos de salida |
| **Filtro de categorías** | `GET /categories` | Dropdown/select en la lista |
| **Proveedores** | `GET/POST/PUT/DELETE /suppliers` | CRUD de proveedores |
| **Órdenes de compra** | `GET/POST/PUT /purchase-orders` + acciones | Flujo OC: borrador → enviada → recibida |
| **Clientes** | `GET/POST/PUT/DELETE /customers` | CRUD de clientes |
| **Ventas / pedidos** | `GET/POST/PUT /sales` + acciones | Flujo venta: borrador → confirmada |

---

## Endpoints completos (32)

| Método | Ruta | Auth | Body / Query |
|--------|------|------|--------------|
| `GET` | `/health` | No | — |
| `GET` | `/products` | Sí | `?q=nombre&categoria=valor&bajoStock=true` |
| `GET` | `/products/:id` | Sí | — |
| `POST` | `/products` | Sí | `{ nombre, categoria, precio, existencia?, stockMinimo? }` |
| `PUT` | `/products/:id` | Sí | `{ nombre?, categoria?, precio?, stockMinimo? }` |
| `DELETE` | `/products/:id` | Sí | — |
| `GET` | `/categories` | Sí | — |
| `GET` | `/entries` | Sí | `?productId=opcional` |
| `POST` | `/entries` | Sí | `{ productId, cantidad, motivo? }` |
| `GET` | `/outputs` | Sí | `?productId=opcional` |
| `POST` | `/outputs` | Sí | `{ productId, cantidad, motivo? }` |
| `GET` | `/suppliers` | Sí | `?q=nombre&activo=true|false` |
| `GET` | `/suppliers/:id` | Sí | — |
| `POST` | `/suppliers` | Sí | `{ nombre, contacto?, email?, telefono?, categorias?, activo? }` |
| `PUT` | `/suppliers/:id` | Sí | campos opcionales del proveedor |
| `DELETE` | `/suppliers/:id` | Sí | — (409 si tiene OC abiertas) |
| `GET` | `/purchase-orders` | Sí | `?estado=borrador|enviada|recibida|cancelada&supplierId=` |
| `GET` | `/purchase-orders/:id` | Sí | — |
| `POST` | `/purchase-orders` | Sí | `{ supplierId, items[{productId, cantidad, precioUnitario}], notas? }` |
| `PUT` | `/purchase-orders/:id` | Sí | solo en estado `borrador` |
| `POST` | `/purchase-orders/:id/send` | Sí | borrador → enviada |
| `POST` | `/purchase-orders/:id/receive` | Sí | enviada → recibida (crea entradas + stock) |
| `POST` | `/purchase-orders/:id/cancel` | Sí | borrador o enviada → cancelada |
| `GET` | `/customers` | Sí | `?q=nombre&activo=true|false` |
| `GET` | `/customers/:id` | Sí | — |
| `POST` | `/customers` | Sí | `{ nombre, email?, telefono?, nit?, activo? }` |
| `PUT` | `/customers/:id` | Sí | campos opcionales del cliente |
| `DELETE` | `/customers/:id` | Sí | — (409 si tiene ventas en borrador) |
| `GET` | `/sales` | Sí | `?estado=borrador|confirmada|cancelada&customerId=` |
| `GET` | `/sales/:id` | Sí | — |
| `POST` | `/sales` | Sí | `{ customerId, items[{productId, cantidad, precioUnitario}], notas? }` |
| `PUT` | `/sales/:id` | Sí | solo en estado `borrador` |
| `POST` | `/sales/:id/confirm` | Sí | borrador → confirmada (crea salidas + stock) |
| `POST` | `/sales/:id/cancel` | Sí | borrador → cancelada |

---

## Modelo Producto (respuesta)

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "nombre": "Laptop Dell",
  "categoria": "Electronica",
  "precio": 800,
  "existencia": 10,
  "stockMinimo": 5,
  "createdAt": "2026-07-15T20:00:00.000Z",
  "updatedAt": "2026-07-15T20:00:00.000Z"
}
```

## Formato de respuesta estándar

```json
{
  "success": true,
  "message": "Productos obtenidos correctamente",
  "data": {
    "total": 1,
    "products": []
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Existencia insuficiente para la salida",
  "error": "INSUFFICIENT_STOCK"
}
```

---

## Reglas de negocio importantes

1. La **existencia** solo cambia con `POST /entries` (suma) y `POST /outputs` (resta).
2. No se puede editar `existencia` directamente con `PUT /products/:id`.
3. Si `cantidad > existencia` en una salida → error `400 INSUFFICIENT_STOCK`.
4. Al crear producto, `existencia` es opcional (default `0`).
5. No se puede `DELETE /products/:id` si tiene entradas o salidas → error `409 PRODUCT_HAS_MOVEMENTS`.
6. No se puede `DELETE /suppliers/:id` si tiene órdenes en `borrador` o `enviada` → `409 SUPPLIER_HAS_OPEN_ORDERS`.
7. Órdenes de compra: solo `borrador` es editable; `receive` genera entradas automáticas con motivo `OC-{id} recepción {proveedor}`.
8. Cada producto tiene `stockMinimo` (default `5`). `GET /products?bajoStock=true` filtra por umbral individual.
9. Entradas y salidas guardan `registradoPor` (email del usuario JWT) para auditoría.
10. Ventas: solo `borrador` es editable; `confirm` genera salidas automáticas con motivo `VENTA-{id} {cliente}`.

---

## Ejemplos para Axios (frontend)

```javascript
const API = import.meta.env.VITE_INVENTORY_SERVICE_URL; // http://localhost:3002

// Listar productos
const res = await axios.get(`${API}/products`, {
  headers: { Authorization: `Bearer ${token}` },
  params: { q: 'laptop', categoria: 'Electronica' },
});

// Crear producto
await axios.post(`${API}/products`, {
  nombre: 'Mouse',
  categoria: 'Electronica',
  precio: 25,
  existencia: 50,
}, { headers: { Authorization: `Bearer ${token}` } });

// Registrar entrada
await axios.post(`${API}/entries`, {
  productId: '665f1a2b3c4d5e6f7a8b9c0d',
  cantidad: 10,
  motivo: 'Compra a proveedor',
}, { headers: { Authorization: `Bearer ${token}` } });

// Registrar salida
await axios.post(`${API}/outputs`, {
  productId: '665f1a2b3c4d5e6f7a8b9c0d',
  cantidad: 3,
  motivo: 'Venta',
}, { headers: { Authorization: `Bearer ${token}` } });
```

---

## Resumen para el equipo frontend

- **Mínimo lab:** 6 pantallas (lista, buscar, crear, editar, entrada, salida).
- **Recomendado:** 8–9 pantallas (agregar detalle + historial de movimientos).
- **Servicio:** solo `inventory-service` puerto `3002`.
- **Auth y reportes** son otros servicios (`3001` y `3003`).
