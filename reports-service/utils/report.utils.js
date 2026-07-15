export function groupProductsByCategory(products) {
    const groups = new Map();

    for (const product of products) {
        const category = product.category || 'Sin categoría';
        const current = groups.get(category) ?? {
            category,
            productCount: 0,
            totalStock: 0,
            estimatedValue: 0,
        };

        current.productCount += 1;
        current.totalStock += product.stock;
        current.estimatedValue += product.stock * product.price;

        groups.set(category, current);
    }

    return [...groups.values()].sort((a, b) => b.totalStock - a.totalStock);
}

export function buildTopProductsFromOutputs(outputs, productLookup = new Map()) {
    const aggregation = new Map();

    for (const output of outputs) {
        const key = String(output.productId ?? output.productName ?? output.id ?? 'unknown');
        const current = aggregation.get(key) ?? {
            productId: output.productId ?? null,
            productName: output.productName ?? 'Producto',
            soldUnits: 0,
            movements: 0,
        };

        current.soldUnits += output.quantity;
        current.movements += 1;

        aggregation.set(key, current);
    }

    return [...aggregation.values()]
        .map((entry) => {
            const product = productLookup.get(String(entry.productId)) ?? productLookup.get(String(entry.productName)) ?? null;

            return {
                ...entry,
                category: product?.category ?? null,
                currentStock: product?.stock ?? null,
                price: product?.price ?? null,
            };
        })
        .sort((a, b) => b.soldUnits - a.soldUnits);
}

export function buildProductLookup(products) {
    const lookup = new Map();

    for (const product of products) {
        if (product.id !== null && product.id !== undefined) {
            lookup.set(String(product.id), product);
        }

        if (product.name) {
            lookup.set(String(product.name), product);
        }
    }

    return lookup;
}

export function sumBy(items, selector) {
    return items.reduce((total, item) => total + Number(selector(item) ?? 0), 0);
}

export function isLowStock(product, fallbackThreshold = 5) {
    const minStock = Number.isFinite(product.minStock) ? product.minStock : fallbackThreshold;
    return product.stock > 0 && product.stock <= minStock;
}

function parseMovementDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinDays(date, days) {
    if (!date) {
        return false;
    }

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return date.getTime() >= cutoff;
}

export function buildRotationReport(products, entries = [], outputs = [], days = 30) {
    const aggregation = new Map();

    for (const product of products) {
        aggregation.set(String(product.id), {
            productId: product.id,
            productName: product.name,
            category: product.category,
            currentStock: product.stock,
            entriesQty: 0,
            outputsQty: 0,
            totalMovement: 0,
            movements: 0,
        });
    }

    for (const entry of entries) {
        const key = String(entry.productId);
        const current = aggregation.get(key);

        if (!current || !isWithinDays(parseMovementDate(entry.date), days)) {
            continue;
        }

        current.entriesQty += entry.quantity;
        current.totalMovement += entry.quantity;
        current.movements += 1;
    }

    for (const output of outputs) {
        const key = String(output.productId);
        const current = aggregation.get(key);

        if (!current || !isWithinDays(parseMovementDate(output.date), days)) {
            continue;
        }

        current.outputsQty += output.quantity;
        current.totalMovement += output.quantity;
        current.movements += 1;
    }

    return [...aggregation.values()]
        .filter((item) => item.totalMovement > 0)
        .sort((a, b) => b.totalMovement - a.totalMovement);
}

export function buildNoMovementReport(products, outputs = [], days = 30) {
    const lastOutputByProduct = new Map();

    for (const output of outputs) {
        const key = String(output.productId);
        const outputDate = parseMovementDate(output.date);

        if (!outputDate) {
            continue;
        }

        const current = lastOutputByProduct.get(key);

        if (!current || outputDate > current) {
            lastOutputByProduct.set(key, outputDate);
        }
    }

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return products
        .filter((product) => product.stock > 0)
        .map((product) => {
            const lastOutputDate = lastOutputByProduct.get(String(product.id)) ?? null;
            const lastOutputMs = lastOutputDate?.getTime() ?? null;
            const hasRecentOutput = lastOutputMs !== null && lastOutputMs >= cutoff;

            return {
                productId: product.id,
                productName: product.name,
                category: product.category,
                currentStock: product.stock,
                lastOutputDate: lastOutputDate ? lastOutputDate.toISOString() : null,
                daysSinceLastOutput: lastOutputMs
                    ? Math.floor((Date.now() - lastOutputMs) / (24 * 60 * 60 * 1000))
                    : null,
                noRecentMovement: !hasRecentOutput,
            };
        })
        .filter((item) => item.noRecentMovement)
        .sort((a, b) => (b.daysSinceLastOutput ?? 9999) - (a.daysSinceLastOutput ?? 9999));
}