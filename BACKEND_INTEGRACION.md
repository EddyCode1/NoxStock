# NoxStock - Backend integrado

Guía para levantar los **3 microservicios** con autenticación unificada.

## Servicios

| Servicio | Puerto | Carpeta |
|----------|--------|---------|
| Auth | 3001 | `auth-service/` |
| Inventario | 3002 | `inventory-service/` |
| Reportes | 3003 | `reports-service/` |

## Inicio rápido

### 1. MongoDB

```bash
docker compose up -d
```

### 2. Variables de entorno

En cada servicio:

```bash
cp auth-service/.env.example auth-service/.env
cp inventory-service/.env.example inventory-service/.env
cp reports-service/.env.example reports-service/.env
```

**Importante:** los 3 servicios deben compartir el mismo `JWT_SECRET`.

### 3. Instalar y levantar (3 terminales)

```bash
cd auth-service && pnpm install && pnpm dev
cd inventory-service && pnpm install && pnpm dev
cd reports-service && pnpm install && pnpm dev
```

## Credenciales maestras (desarrollo)

Al iniciar `auth-service` se crea automáticamente un usuario admin si no existe:

| Campo | Valor |
|-------|-------|
| Email | `admin@noxstock.com` |
| Password | `NoxStock2026!` |
| Rol | `admin` |

Variables opcionales en `auth-service/.env`:

```env
SEED_DATA=true
MASTER_EMAIL=admin@noxstock.com
MASTER_PASSWORD=NoxStock2026!
SEED_USER_PASSWORD=NoxStock2026!
```

## Datos de prueba automáticos (seed)

Al iniciar los servicios con `SEED_DATA=true`, se cargan datos base en MongoDB si no existen.

Los datos viven en el repositorio (`auth-service/seed/` e `inventory-service/seed/`), no en archivos locales.

| Servicio | Colección | Cantidad |
|----------|-----------|----------|
| auth-service | users | 10 usuarios |
| inventory-service | products | 10 productos |
| inventory-service | entries | 10 entradas |
| inventory-service | outputs | 10 salidas |

### Usuarios de prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@noxstock.com | NoxStock2026! | admin |
| kevin@noxstock.com | NoxStock2026! | user |
| eddy@noxstock.com | NoxStock2026! | user |
| sajche@noxstock.com | NoxStock2026! | user |
| ana@noxstock.com | NoxStock2026! | user |
| luis@noxstock.com | NoxStock2026! | user |
| maria@noxstock.com | NoxStock2026! | user |
| carlos@noxstock.com | NoxStock2026! | user |
| sofia@noxstock.com | NoxStock2026! | user |
| pedro@noxstock.com | NoxStock2026! | user |

El seed es **idempotente**: si los datos ya existen, no los duplica.

## Flujo de prueba completo

### 1. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@noxstock.com\",\"password\":\"NoxStock2026!\"}"
```

Guarda el `token` de la respuesta.

### 2. Crear producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"nombre\":\"Laptop\",\"categoria\":\"Electronica\",\"precio\":800,\"existencia\":10}"
```

### 3. Registrar salida

```bash
curl -X POST http://localhost:3002/outputs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"productId\":\"ID_PRODUCTO\",\"cantidad\":2,\"motivo\":\"Venta\"}"
```

### 4. Consultar alertas

```bash
curl http://localhost:3003/alerts/low-stock \
  -H "Authorization: Bearer TOKEN"
```

### 5. Reporte general

```bash
curl http://localhost:3003/reports/summary \
  -H "Authorization: Bearer TOKEN"
```

## Integración entre servicios

```
Frontend / Cliente
      │
      ▼
 auth-service:3001  → emite JWT
      │
      ├─► inventory-service:3002  → valida JWT, CRUD + movimientos
      │
      └─► reports-service:3003     → valida JWT, consume inventory por HTTP
```

## JWT compartido

```env
JWT_SECRET=noxstock_jwt_secret_dev_2026
```

Debe ser idéntico en `auth-service`, `inventory-service` y `reports-service`.

## Endpoints por servicio

### Auth (3001)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/perfil`

### Inventario (3002)
- Ver `inventory-service/API_FRONTEND.md`

### Reportes (3003)
- `GET /alerts/low-stock`
- `GET /alerts/out-of-stock`
- `GET /reports/top-products`
- `GET /reports/categories`
- `GET /reports/summary`
