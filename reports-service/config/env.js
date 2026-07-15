export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3003),
    jwtSecret: process.env.JWT_SECRET ?? 'noxstock_jwt_secret_dev_2026',
    inventoryServiceUrl: (process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3002').replace(/\/$/, ''),
    lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD ?? 5),
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 8000),
    useMockInventory: process.env.USE_MOCK_INVENTORY === 'true',
    allowMockFallback: process.env.ALLOW_MOCK_FALLBACK !== 'false',
    allowDevToken: process.env.ALLOW_DEV_TOKEN === 'true',
};

if (!env.jwtSecret && env.nodeEnv !== 'test') {
    console.warn('[reports-service] JWT_SECRET no está configurado.');
}
