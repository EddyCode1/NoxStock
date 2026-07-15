import { env } from '../config/env.js';
import { getProductsFromInventory } from '../services/inventory.service.js';

import { isLowStock } from '../utils/report.utils.js';

export async function getLowStockAlerts(req, res, next) {
    try {
        const defaultThreshold = Number.isFinite(Number(req.query.threshold))
            ? Number(req.query.threshold)
            : env.lowStockThreshold;

        const products = await getProductsFromInventory(req.headers.authorization);
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
        const products = await getProductsFromInventory(req.headers.authorization);
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
