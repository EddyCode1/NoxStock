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

function buildAuthHeaders(authHeader) {
    if (!authHeader) {
        return {};
    }

    return {
        Authorization: authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`,
    };
}

function extractCollection(data, preferredKeys = []) {
    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const containers = [data];

    if (data.data && typeof data.data === 'object') {
        containers.push(data.data);
    }

    for (const container of containers) {
        for (const key of preferredKeys) {
            if (Array.isArray(container[key])) {
                return container[key];
            }
        }

        for (const key of ['products', 'outputs', 'entries', 'movements', 'items', 'results']) {
            if (Array.isArray(container[key])) {
                return container[key];
            }
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

export function normalizeProduct(raw = {}, defaultMinStock = 5) {
    const stock = toNumber(raw.existencia ?? raw.stock ?? raw.quantity ?? raw.currentStock, 0);
    const price = toNumber(raw.precio ?? raw.price ?? raw.unitPrice ?? raw.cost ?? raw.valor, 0);
    const minStock = toNumber(raw.stockMinimo ?? raw.minStock, defaultMinStock);

    return {
        id: raw._id ?? raw.id ?? raw.productId ?? raw.sku ?? null,
        name: raw.nombre ?? raw.name ?? raw.productName ?? 'Producto sin nombre',
        category: readCategory(raw),
        stock,
        price,
        minStock,
        raw,
    };
}

export function normalizeOutput(raw = {}) {
    const quantity = toNumber(raw.cantidad ?? raw.quantity ?? raw.units ?? raw.amount, 0);
    const productId = raw.productId?._id ?? raw.productId ?? raw.product?._id ?? raw.product?.id ?? null;

    return {
        id: raw._id ?? raw.id ?? null,
        productId,
        productName: raw.productName ?? raw.productId?.nombre ?? raw.product?.nombre ?? raw.product?.name ?? 'Producto',
        quantity,
        date: raw.fecha ?? raw.createdAt ?? raw.date ?? null,
        raw,
    };
}

export function normalizeEntry(raw = {}) {
    const quantity = toNumber(raw.cantidad ?? raw.quantity ?? raw.units ?? raw.amount, 0);
    const productId = raw.productId?._id ?? raw.productId ?? raw.product?._id ?? raw.product?.id ?? null;

    return {
        id: raw._id ?? raw.id ?? null,
        productId,
        productName: raw.productName ?? raw.productId?.nombre ?? raw.product?.nombre ?? raw.product?.name ?? 'Producto',
        quantity,
        date: raw.fecha ?? raw.createdAt ?? raw.date ?? null,
        raw,
    };
}

async function requestCollection(candidatePaths, preferredKeys, authHeader, warehouseId) {
    let lastError = null;
    const headers = buildAuthHeaders(authHeader);
    const params = warehouseId ? { warehouseId } : undefined;

    for (const path of candidatePaths) {
        try {
            const response = await http.get(path, { headers, params });
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
    return normalizeCollection(mockProducts, (raw) => normalizeProduct(raw, env.lowStockThreshold));
}

function getMockOutputs() {
    return normalizeCollection(mockOutputs, normalizeOutput);
}

export async function getProductsFromInventory(authHeader, warehouseId) {
    if (env.useMockInventory) {
        return getMockProducts();
    }

    try {
        const payload = await requestCollection(['/products'], ['products'], authHeader, warehouseId);
        return extractCollection(payload, ['products']).map((raw) => normalizeProduct(raw, env.lowStockThreshold));
    } catch (error) {
        if (env.allowMockFallback) {
            console.warn('[reports-service] Usando productos mock por fallo en inventory-service');
            return getMockProducts();
        }

        throw error;
    }
}

export async function getOutputsFromInventory(authHeader, warehouseId) {
    if (env.useMockInventory) {
        return getMockOutputs();
    }

    try {
        const payload = await requestCollection(['/outputs', '/movements/outputs', '/inventory/outputs'], ['outputs'], authHeader, warehouseId);
        return extractCollection(payload, ['outputs']).map(normalizeOutput);
    } catch (error) {
        if (env.allowMockFallback) {
            console.warn('[reports-service] Usando salidas mock por fallo en inventory-service');
            return getMockOutputs();
        }

        throw error;
    }
}

export async function getEntriesFromInventory(authHeader, warehouseId) {
    if (env.useMockInventory) {
        return [];
    }

    try {
        const payload = await requestCollection(['/entries', '/movements/entries', '/inventory/entries'], ['entries'], authHeader, warehouseId);
        return extractCollection(payload, ['entries']).map(normalizeEntry);
    } catch (error) {
        if (env.allowMockFallback) {
            console.warn('[reports-service] Entradas no disponibles, usando lista vacía');
            return [];
        }

        throw error;
    }
}
