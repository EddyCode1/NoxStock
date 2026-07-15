import { env } from '../config/env.js';
import { getProductsFromInventory } from '../services/inventory.service.js';

import { isLowStock } from '../utils/report.utils.js';

function resolveWarehouseId(req) {
    const warehouseId = req.query.warehouseId;
    return typeof warehouseId === 'string' && warehouseId.trim() ? warehouseId.trim() : null;
}

export async function getLowStockAlerts(req, res, next) {
    try {
        const defaultThreshold = Number.isFinite(Number(req.query.threshold))
            ? Number(req.query.threshold)
            : env.lowStockThreshold;

        const warehouseId = resolveWarehouseId(req);
        const products = await getProductsFromInventory(req.headers.authorization, warehouseId);
        const lowStockProducts = products.filter((product) => isLowStock(product, defaultThreshold));

        return res.status(200).json({
            success: true,
            threshold: defaultThreshold,
            usesPerProductMinStock: true,
            count: lowStockProducts.length,
            data: lowStockProducts,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getOutOfStockAlerts(req, res, next) {
    try {
        const warehouseId = resolveWarehouseId(req);
        const products = await getProductsFromInventory(req.headers.authorization, warehouseId);
        const outOfStockProducts = products.filter((product) => product.stock === 0);

        return res.status(200).json({
            success: true,
            count: outOfStockProducts.length,
            data: outOfStockProducts,
        });
    } catch (error) {
        return next(error);
    }
}
