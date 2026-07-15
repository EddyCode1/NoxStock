import axios from 'axios';
import { env } from '../config/env.js';
import { mockOutputs, mockProducts } from './mockInventory.data.js';

const http = axios.create({
    baseURL: env.inventoryServiceUrl,
    timeout: env.requestTimeoutMs,
    headers: {
        'Content-Type': 'application/json',
    },
});

function extractCollection(data, preferredKeys = []) {
    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    for (const key of preferredKeys) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    for (const key of ['data', 'items', 'results', 'products', 'outputs', 'movements']) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    return [];
}

function toNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeCollection(collection, normalizer) {
    return collection.map(normalizer);
}

function readCategory(raw) {
    if (!raw) {
        return 'Sin categoría';
    }

    if (typeof raw.categoria === 'string') {
        return raw.categoria;
    }

    if (typeof raw.category === 'string') {
        return raw.category;
    }

    if (raw.category?.name) {
        return raw.category.name;
    }

    if (raw.categoria?.nombre) {
        return raw.categoria.nombre;
    }

    return 'Sin categoría';
}

export function normalizeProduct(raw = {}) {
    const stock = toNumber(raw.existencia ?? raw.stock ?? raw.quantity ?? raw.currentStock, 0);
    const price = toNumber(raw.precio ?? raw.price ?? raw.unitPrice ?? raw.cost ?? raw.valor, 0);

    return {
        id: raw._id ?? raw.id ?? raw.productId ?? raw.sku ?? null,
        name: raw.nombre ?? raw.name ?? raw.productName ?? 'Producto sin nombre',
        category: readCategory(raw),
        stock,
        price,
        raw,
    };
}

export function normalizeOutput(raw = {}) {
    const quantity = toNumber(raw.cantidad ?? raw.quantity ?? raw.units ?? raw.amount, 0);
    const productId = raw.productId ?? raw.product?._id ?? raw.product?.id ?? null;

    return {
        id: raw._id ?? raw.id ?? null,
        productId,
        productName: raw.productName ?? raw.product?.nombre ?? raw.product?.name ?? 'Producto',
        quantity,
        date: raw.fecha ?? raw.createdAt ?? raw.date ?? null,
        raw,
    };
}

async function requestCollection(candidatePaths) {
    let lastError = null;

    for (const path of candidatePaths) {
        try {
            const response = await http.get(path);
            return response.data;
        } catch (error) {
            lastError = error;

            const status = error?.response?.status;
            if (status && status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error('No se pudo obtener la colección solicitada');
}

function getMockProducts() {
    return normalizeCollection(mockProducts, normalizeProduct);
}

function getMockOutputs() {
    return normalizeCollection(mockOutputs, normalizeOutput);
}

export async function getProductsFromInventory() {
    if (env.useMockInventory) {
        return getMockProducts();
    }

    try {
        const payload = await requestCollection(['/products']);
        return extractCollection(payload, ['products']).map(normalizeProduct);
    } catch (error) {
        if (env.allowMockFallback) {
            return getMockProducts();
        }

        throw error;
    }
}

export async function getOutputsFromInventory() {
    if (env.useMockInventory) {
        return getMockOutputs();
    }

    try {
        const payload = await requestCollection(['/outputs', '/movements/outputs', '/inventory/outputs']);
        return extractCollection(payload, ['outputs', 'movements']).map(normalizeOutput);
    } catch (error) {
        if (env.allowMockFallback) {
            return getMockOutputs();
        }

        throw error;
    }
}