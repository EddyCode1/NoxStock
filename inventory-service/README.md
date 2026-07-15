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
- `POST /entries` - Registrar entrada de inventario
- `POST /outputs` - Registrar salida de inventario

## Variables de Entorno

Crear un archivo `.env` en la raíz del servicio:

```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/noxstock-inventory
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
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
│   ├── Category.js    # Modelo de Categoría
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
│   └── auth.js        # Middleware de autenticación
└── helpers/
    └── validateJwt.js # Utilidades de validación JWT
```

## Notas
- Todos los endpoints requieren un JWT válido excepto los que el equipo decida mantener públicos
- La existencia de los productos se actualiza automáticamente al registrar entradas y salidas
