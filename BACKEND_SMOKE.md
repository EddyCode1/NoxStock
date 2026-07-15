# Smoke test backend — NoxStock

Prueba rápida del flujo integrado (PowerShell). Requiere los 3 servicios corriendo (`pnpm start:all`).

## 1. Login

```powershell
$login = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST `
  -Body '{"email":"admin@noxstock.com","password":"1234"}' -ContentType "application/json"
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }
```

## 2. Inventario — listar productos

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/products" -Headers $headers
```

## 3. Inventario — salida con stock insuficiente (debe fallar 400)

```powershell
# Reemplaza PRODUCT_ID con un id real
try {
  Invoke-WebRequest -Uri "http://localhost:3002/outputs" -Method POST -Headers $headers `
    -Body '{"productId":"PRODUCT_ID","cantidad":99999,"motivo":"test"}' -ContentType "application/json"
} catch { $_.Exception.Response.StatusCode.value__ }
```

## 4. Reportes — resumen con datos reales

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/reports/summary" -Headers $headers
```

## 5. Reportes — alertas

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/alerts/low-stock" -Headers $headers
```

## 6. Proveedores y orden de compra

```powershell
# Listar proveedores (seed crea 3)
$suppliers = Invoke-RestMethod -Uri "http://localhost:3002/suppliers" -Headers $headers
$supplierId = $suppliers.data.suppliers[0]._id

# Listar OC (seed crea 1 en borrador)
$orders = Invoke-RestMethod -Uri "http://localhost:3002/purchase-orders" -Headers $headers
$orderId = $orders.data.orders[0]._id

# Enviar y recibir OC (actualiza stock)
Invoke-RestMethod -Uri "http://localhost:3002/purchase-orders/$orderId/send" -Method POST -Headers $headers
Invoke-RestMethod -Uri "http://localhost:3002/purchase-orders/$orderId/receive" -Method POST -Headers $headers
```

## Criterio de éxito

- Login devuelve `token`
- `/products` devuelve lista con `success: true`
- Salida inválida devuelve `400`
- `/reports/summary` devuelve `data.inventory.totalProducts` > 0 (con seeds activos)
- Si inventory-service está apagado y `ALLOW_MOCK_FALLBACK=false`, reports debe fallar con error explícito
- `/suppliers` devuelve al menos 1 proveedor con seeds activos
- Flujo OC `send` + `receive` devuelve `estado: recibida` y crea entradas
