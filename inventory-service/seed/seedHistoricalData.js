import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';
import Customer from '../models/Customer.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Sale from '../models/Sale.js';

const HISTORY_DAYS = 90;
const HISTORY_PREFIX = 'SEED-HIST';

const BRANCH_CODES = {
  'Sucursal Zona 10': 'Z10',
  'Sucursal Mixco': 'MIX',
  'Sucursal Antigua': 'ANT',
  Pamp: 'PAMP',
};

const ENTRY_REASONS = [
  'Compra proveedor',
  'Reposicion almacen',
  'Devolucion cliente',
  'Ajuste entrada',
  'Transferencia recibida',
];

const OUTPUT_REASONS = [
  'Venta mostrador',
  'Venta mayoreo',
  'Pedido cliente',
  'Merma controlada',
  'Ajuste salida',
];

const dayAt = (daysAgo, hour = 10) => {
  const date = new Date();
  date.setHours(hour, (daysAgo * 7) % 60, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const formatStamp = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const pick = (list, index) => list[index % list.length];

const quantityBetween = (min, max, seed) => min + (seed % (max - min + 1));

async function branchNeedsHistorical(warehouseId) {
  const count = await Entry.countDocuments({
    warehouseId,
    motivo: { $regex: `^${HISTORY_PREFIX}-` },
  });
  return count < 10;
}

async function seedHistoricalMovements(catalog, warehouse, branchCode) {
  let created = 0;
  const products = [];

  for (const productData of catalog.products) {
    const product = await Product.findOne({ nombre: productData.nombre });
    if (product) {
      products.push({ product, precio: productData.precio });
    }
  }

  if (products.length === 0) {
    return 0;
  }

  for (let daysBack = 1; daysBack <= HISTORY_DAYS; daysBack += 2) {
    const entryDate = dayAt(daysBack, 9 + (daysBack % 6));
    const entryStamp = formatStamp(entryDate);
    const entryProduct = pick(products, daysBack);
    const entryMotivo = `${HISTORY_PREFIX}-E-${branchCode}-${entryStamp}`;

    if (!(await Entry.findOne({ motivo: entryMotivo }))) {
      await Entry.create({
        productId: entryProduct.product._id,
        warehouseId: warehouse._id,
        cantidad: quantityBetween(5, 35, daysBack + products.length),
        motivo: entryMotivo,
        registradoPor: 'seed-historico',
        fecha: entryDate,
      });
      created += 1;
    }

    const outputDaysBack = Math.max(1, daysBack - 1);
    const outputDate = dayAt(outputDaysBack, 14 + (daysBack % 5));
    const outputStamp = formatStamp(outputDate);
    const outputProduct = pick(products, daysBack + 2);
    const outputMotivo = `${HISTORY_PREFIX}-S-${branchCode}-${outputStamp}`;

    if (!(await Output.findOne({ motivo: outputMotivo }))) {
      await Output.create({
        productId: outputProduct.product._id,
        warehouseId: warehouse._id,
        cantidad: quantityBetween(1, 18, daysBack * 3),
        motivo: outputMotivo,
        registradoPor: 'seed-historico',
        fecha: outputDate,
      });
      created += 1;
    }
  }

  return created;
}

async function seedHistoricalPurchaseOrders(catalog, warehouse, branchCode, supplier) {
  let created = 0;
  const products = [];

  for (const productData of catalog.products) {
    const product = await Product.findOne({ nombre: productData.nombre });
    if (product) {
      products.push({ product, precio: productData.precio });
    }
  }

  if (!supplier || products.length === 0) {
    return 0;
  }

  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    for (let orderIndex = 1; orderIndex <= 2; orderIndex += 1) {
      const daysBack = 12 + monthOffset * 30 + orderIndex * 9;
      const orderDate = dayAt(daysBack, 11);
      const stamp = formatStamp(orderDate);
      const notas = `${HISTORY_PREFIX}-OC-${branchCode}-${stamp}-${orderIndex}`;

      if (await PurchaseOrder.findOne({ notas })) {
        continue;
      }

      const itemA = pick(products, monthOffset + orderIndex);
      const itemB = pick(products, monthOffset + orderIndex + 1);

      await PurchaseOrder.create({
        supplierId: supplier._id,
        warehouseId: warehouse._id,
        items: [
          {
            productId: itemA.product._id,
            cantidad: quantityBetween(10, 40, daysBack),
            precioUnitario: Math.round(itemA.precio * 0.82 * 100) / 100,
          },
          {
            productId: itemB.product._id,
            cantidad: quantityBetween(8, 25, daysBack + 3),
            precioUnitario: Math.round(itemB.precio * 0.8 * 100) / 100,
          },
        ],
        notas,
        estado: monthOffset === 0 ? 'enviada' : 'recibida',
        creadoPor: 'seed-historico',
        createdAt: orderDate,
        updatedAt: orderDate,
        fechaEnvio: orderDate,
        fechaRecepcion: monthOffset === 0 ? undefined : dayAt(daysBack - 4, 16),
      });

      created += 1;
    }
  }

  return created;
}

async function seedHistoricalSales(catalog, warehouse, branchCode, customer) {
  let created = 0;
  const products = [];

  for (const productData of catalog.products) {
    const product = await Product.findOne({ nombre: productData.nombre });
    if (product) {
      products.push({ product, precio: productData.precio });
    }
  }

  if (!customer || products.length === 0) {
    return 0;
  }

  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    for (let saleIndex = 1; saleIndex <= 3; saleIndex += 1) {
      const daysBack = 8 + monthOffset * 30 + saleIndex * 7;
      const saleDate = dayAt(daysBack, 15);
      const stamp = formatStamp(saleDate);
      const notas = `${HISTORY_PREFIX}-VTA-${branchCode}-${stamp}-${saleIndex}`;

      if (await Sale.findOne({ notas })) {
        continue;
      }

      const itemA = pick(products, monthOffset + saleIndex);
      const itemB = pick(products, monthOffset + saleIndex + 2);

      await Sale.create({
        customerId: customer._id,
        warehouseId: warehouse._id,
        items: [
          {
            productId: itemA.product._id,
            cantidad: quantityBetween(2, 12, daysBack),
            precioUnitario: itemA.precio,
          },
          {
            productId: itemB.product._id,
            cantidad: quantityBetween(1, 8, daysBack + 1),
            precioUnitario: Math.round(itemB.precio * 0.95 * 100) / 100,
          },
        ],
        notas,
        estado: 'confirmada',
        creadoPor: 'seed-historico',
        createdAt: saleDate,
        updatedAt: saleDate,
        fechaConfirmacion: saleDate,
      });

      created += 1;
    }
  }

  return created;
}

/**
 * Genera movimientos, ventas y órdenes de compra distribuidos en ~90 días
 * para cada sucursal operativa (no Central).
 */
export async function seedHistoricalData(warehouseCatalogs = []) {
  let movements = 0;
  let sales = 0;
  let purchaseOrders = 0;
  let branchesSeeded = 0;

  for (const catalog of warehouseCatalogs) {
    const branchCode = BRANCH_CODES[catalog.warehouseName];
    if (!branchCode) {
      continue;
    }

    const warehouse = await Warehouse.findOne({
      nombre: catalog.warehouseName,
      esCentral: { $ne: true },
    });

    if (!warehouse) {
      console.warn(`[inventory-service] Sin bodega para historico: ${catalog.warehouseName}`);
      continue;
    }

    if (!(await branchNeedsHistorical(warehouse._id))) {
      continue;
    }

    const supplier = await Supplier.findOne({ warehouseId: warehouse._id }).sort({ createdAt: 1 });
    const customer = await Customer.findOne({ warehouseId: warehouse._id }).sort({ createdAt: 1 });

    movements += await seedHistoricalMovements(catalog, warehouse, branchCode);
    purchaseOrders += await seedHistoricalPurchaseOrders(catalog, warehouse, branchCode, supplier);
    sales += await seedHistoricalSales(catalog, warehouse, branchCode, customer);
    branchesSeeded += 1;
  }

  if (branchesSeeded === 0) {
    console.log('[inventory-service] Historico 3 meses ya presente en todas las sucursales');
    return { skipped: true, movements: 0, sales: 0, purchaseOrders: 0 };
  }

  console.log(
    `[inventory-service] Historico 3 meses (${branchesSeeded} sucursales): movimientos=${movements}, ventas=${sales}, OC=${purchaseOrders}`
  );

  return { skipped: false, movements, sales, purchaseOrders, branchesSeeded };
}

export default seedHistoricalData;
