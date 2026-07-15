# Servicio de Gestión de Inventario - NoxStock

## Descripción
Este es el servicio responsable de la administración de productos y movimientos del inventario en el sistema NoxStock.

## Funcionalidades
- Registrar productos
- Editar productos
- Eliminar productos
- Consultar productos
- Buscar productos por nombre o categoría
- Administrar categorías
- Registrar entradas de inventario
- Registrar salidas de inventario
- Actualizar automáticamente la existencia de los productos

## Modelo Producto
- nombre
- categoría
- precio
- existencia
- (atributos adicionales opcionales según necesidad)

## Endpoints Mínimos

### Productos
- `GET /products` - Obtener todos los productos
- `GET /products/:id` - Obtener producto específico
- `POST /products` - Crear nuevo producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Categorías
- `GET /categories` - Obtener todas las categorías

### Movimientos de Inventario
- `GET /entries` - Obtener historial de entradas
- `POST /entries` - Registrar entrada de inventario
- `GET /outputs` - Obtener historial de salidas
- `POST /outputs` - Registrar salida de inventario

## Variables de Entorno

Crear un archivo `.env` en la raíz del servicio:

```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/noxstock-inventory
JWT_SECRET=noxstock_jwt_secret_dev_2026
NODE_ENV=development
SEED_DATA=true
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
inventory-service/
├── index.js           # Punto de entrada
├── package.json
├── .env
├── config/
│   └── db.js          # Configuración de base de datos
├── models/
│   ├── Product.js     # Modelo de Producto
│   ├── Entry.js       # Modelo de Entrada de Inventario
│   └── Output.js      # Modelo de Salida de Inventario
├── routes/
│   ├── products.js    # Rutas de productos
│   ├── categories.js  # Rutas de categorías
│   ├── entries.js     # Rutas de entradas
│   └── outputs.js     # Rutas de salidas
├── controllers/
│   ├── productController.js
│   ├── categoryController.js
│   ├── entryController.js
│   └── outputController.js
├── middlewares/
│   ├── auth.js
│   ├── validators.js
│   └── errorHandler.js
└── helpers/
    ├── response.js
    └── stock.js       # Actualización atómica de existencia ($inc)
```

## Notas
- Todos los endpoints requieren un JWT válido excepto los que el equipo decida mantener públicos
- La existencia se actualiza de forma atómica con `$inc` al registrar entradas y salidas
- No se puede eliminar un producto que tenga movimientos (`PRODUCT_HAS_MOVEMENTS`)

## Estado de implementación
- Estructura completa del servicio implementada en la rama `ft/sajche`
- Endpoints activos: `/health`, `/products`, `/categories`, `/entries`, `/outputs`
- Búsqueda disponible en `GET /products?q=nombre&categoria=valor`
- Movimientos con validación de stock y actualización atómica de existencia
- Guía para frontend: ver `API_FRONTEND.md`
