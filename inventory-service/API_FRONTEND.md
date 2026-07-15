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

---

## Endpoints completos (11)

| Método | Ruta | Auth | Body / Query |
|--------|------|------|--------------|
| `GET` | `/health` | No | — |
| `GET` | `/products` | Sí | `?q=nombre&categoria=valor` |
| `GET` | `/products/:id` | Sí | — |
| `POST` | `/products` | Sí | `{ nombre, categoria, precio, existencia? }` |
| `PUT` | `/products/:id` | Sí | `{ nombre?, categoria?, precio? }` |
| `DELETE` | `/products/:id` | Sí | — |
| `GET` | `/categories` | Sí | — |
| `GET` | `/entries` | Sí | `?productId=opcional` |
| `POST` | `/entries` | Sí | `{ productId, cantidad, motivo? }` |
| `GET` | `/outputs` | Sí | `?productId=opcional` |
| `POST` | `/outputs` | Sí | `{ productId, cantidad, motivo? }` |

---

## Modelo Producto (respuesta)

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "nombre": "Laptop Dell",
  "categoria": "Electronica",
  "precio": 800,
  "existencia": 10,
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
