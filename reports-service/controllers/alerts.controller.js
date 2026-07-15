import { env } from '../config/env.js';
import { getProductsFromInventory } from '../services/inventory.service.js';

export async function getLowStockAlerts(req, res, next) {
    try {
        const threshold = Number.isFinite(Number(req.query.threshold))
            ? Number(req.query.threshold)
            : env.lowStockThreshold;

        const products = await getProductsFromInventory();
        const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= threshold);

        return res.status(200).json({
            success: true,
            threshold,
            count: lowStockProducts.length,
            data: lowStockProducts,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getOutOfStockAlerts(req, res, next) {
    try {
        const products = await getProductsFromInventory();
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