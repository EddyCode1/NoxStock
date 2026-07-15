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