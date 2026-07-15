import { env } from '../config/env.js';
import { getEntriesFromInventory, getOutputsFromInventory, getProductsFromInventory } from '../services/inventory.service.js';
import {
    buildProductLookup,
    buildTopProductsFromOutputs,
    buildRotationReport,
    buildNoMovementReport,
    groupProductsByCategory,
    isLowStock,
    sumBy,
} from '../utils/report.utils.js';

function resolveWarehouseId(req) {
    const warehouseId = req.query.warehouseId;
    return typeof warehouseId === 'string' && warehouseId.trim() ? warehouseId.trim() : null;
}

export async function getTopProductsReport(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const warehouseId = resolveWarehouseId(req);
        const [products, outputs] = await Promise.all([
            getProductsFromInventory(authHeader, warehouseId),
            getOutputsFromInventory(authHeader, warehouseId),
        ]);

        const productLookup = buildProductLookup(products);
        const topProducts = buildTopProductsFromOutputs(outputs, productLookup).slice(0, 10);

        return res.status(200).json({
            success: true,
            total: topProducts.length,
            data: topProducts,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getCategoriesReport(req, res, next) {
    try {
        const warehouseId = resolveWarehouseId(req);
        const products = await getProductsFromInventory(req.headers.authorization, warehouseId);

        return res.status(200).json({
            success: true,
            totalCategories: groupProductsByCategory(products).length,
            data: groupProductsByCategory(products),
        });
    } catch (error) {
        return next(error);
    }
}

export async function getSummaryReport(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const warehouseId = resolveWarehouseId(req);
        const [products, outputs] = await Promise.all([
            getProductsFromInventory(authHeader, warehouseId),
            getOutputsFromInventory(authHeader, warehouseId),
        ]);

        const categories = groupProductsByCategory(products);
        const productLookup = buildProductLookup(products);
        const topProducts = buildTopProductsFromOutputs(outputs, productLookup).slice(0, 5);

        const totalProducts = products.length;
        const totalCategories = categories.length;
        const totalUnitsInStock = sumBy(products, (product) => product.stock);
        const totalEstimatedValue = sumBy(products, (product) => product.stock * product.price);
        const lowStockProducts = products.filter((product) => isLowStock(product, env.lowStockThreshold));
        const outOfStockProducts = products.filter((product) => product.stock === 0);
        const soldUnits = sumBy(outputs, (output) => output.quantity);

        return res.status(200).json({
            success: true,
            generatedAt: new Date().toISOString(),
            data: {
                inventory: {
                    totalProducts,
                    totalCategories,
                    totalUnitsInStock,
                    totalEstimatedValue,
                    totalSoldUnits: soldUnits,
                },
                alerts: {
                    lowStockCount: lowStockProducts.length,
                    outOfStockCount: outOfStockProducts.length,
                },
                categories: categories.slice(0, 10),
                topProducts,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function getRotationReport(req, res, next) {
    try {
        const days = Number.isFinite(Number(req.query.days))
            ? Number(req.query.days)
            : env.reportMovementDays;
        const authHeader = req.headers.authorization;
        const warehouseId = resolveWarehouseId(req);

        const [products, entries, outputs] = await Promise.all([
            getProductsFromInventory(authHeader, warehouseId),
            getEntriesFromInventory(authHeader, warehouseId),
            getOutputsFromInventory(authHeader, warehouseId),
        ]);

        const data = buildRotationReport(products, entries, outputs, days);

        return res.status(200).json({
            success: true,
            days,
            count: data.length,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getNoMovementReport(req, res, next) {
    try {
        const days = Number.isFinite(Number(req.query.days))
            ? Number(req.query.days)
            : env.reportMovementDays;
        const authHeader = req.headers.authorization;
        const warehouseId = resolveWarehouseId(req);

        const [products, outputs] = await Promise.all([
            getProductsFromInventory(authHeader, warehouseId),
            getOutputsFromInventory(authHeader, warehouseId),
        ]);

        const data = buildNoMovementReport(products, outputs, days);

        return res.status(200).json({
            success: true,
            days,
            count: data.length,
            data,
        });
    } catch (error) {
        return next(error);
    }
}
