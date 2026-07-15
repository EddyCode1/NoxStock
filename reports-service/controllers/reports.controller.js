import { env } from '../config/env.js';
import { getOutputsFromInventory, getProductsFromInventory } from '../services/inventory.service.js';
import {
    buildProductLookup,
    buildTopProductsFromOutputs,
    groupProductsByCategory,
    sumBy,
} from '../utils/report.utils.js';

export async function getTopProductsReport(req, res, next) {
    try {
        const [products, outputs] = await Promise.all([
            getProductsFromInventory(),
            getOutputsFromInventory(),
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
        const products = await getProductsFromInventory();
        const categories = groupProductsByCategory(products);

        return res.status(200).json({
            success: true,
            totalCategories: categories.length,
            data: categories,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getSummaryReport(req, res, next) {
    try {
        const [products, outputs] = await Promise.all([
            getProductsFromInventory(),
            getOutputsFromInventory(),
        ]);

        const categories = groupProductsByCategory(products);
        const productLookup = buildProductLookup(products);
        const topProducts = buildTopProductsFromOutputs(outputs, productLookup).slice(0, 5);

        const totalProducts = products.length;
        const totalCategories = categories.length;
        const totalUnitsInStock = sumBy(products, (product) => product.stock);
        const totalEstimatedValue = sumBy(products, (product) => product.stock * product.price);
        const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= env.lowStockThreshold);
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