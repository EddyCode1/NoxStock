import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Warehouse from '../models/Warehouse.js';
import WarehouseStock from '../models/WarehouseStock.js';
import { syncProductTotal } from '../helpers/warehouseStock.js';
import { shouldRunSeed } from './seedUtils.js';
import { seedHistoricalData } from './seedHistoricalData.js';

const WAREHOUSE_CATALOGS = [
  {
    warehouseName: 'Sucursal Zona 10',
    products: [
      { nombre: 'Laptop Dell Inspiron', categoria: 'Computadoras', precio: 800, existencia: 15, stockMinimo: 5 },
      { nombre: 'Mouse Logitech M185', categoria: 'Computadoras', precio: 25, existencia: 50, stockMinimo: 10 },
      { nombre: 'Teclado Mecanico RGB', categoria: 'Computadoras', precio: 65, existencia: 30, stockMinimo: 8 },
      { nombre: 'Monitor Samsung 24"', categoria: 'Computadoras', precio: 220, existencia: 8, stockMinimo: 10 },
      { nombre: 'Cable HDMI 2m', categoria: 'Accesorios PC', precio: 12, existencia: 40, stockMinimo: 15 },
    ],
    entries: [
      { productName: 'Laptop Dell Inspiron', cantidad: 5, motivo: 'SEED-ENTRY-Z10-01 Compra proveedor tech' },
      { productName: 'Mouse Logitech M185', cantidad: 20, motivo: 'SEED-ENTRY-Z10-02 Reposicion computadoras' },
    ],
    outputs: [
      { productName: 'Laptop Dell Inspiron', cantidad: 2, motivo: 'SEED-OUTPUT-Z10-01 Venta corporativa' },
      { productName: 'Cable HDMI 2m', cantidad: 8, motivo: 'SEED-OUTPUT-Z10-02 Venta accesorios' },
    ],
  },
  {
    warehouseName: 'Sucursal Mixco',
    products: [
      { nombre: 'Leche Entera Dos Pinos 1L', categoria: 'Lacteos', precio: 12, existencia: 80, stockMinimo: 20 },
      { nombre: 'Queso Fresco Libra', categoria: 'Lacteos', precio: 28, existencia: 45, stockMinimo: 10 },
      { nombre: 'Yogurt Griego 200g', categoria: 'Lacteos', precio: 8, existencia: 120, stockMinimo: 25 },
      { nombre: 'Mantequilla 200g', categoria: 'Lacteos', precio: 15, existencia: 60, stockMinimo: 15 },
      { nombre: 'Crema de Leche 1L', categoria: 'Lacteos', precio: 18, existencia: 35, stockMinimo: 12 },
    ],
    entries: [
      { productName: 'Leche Entera Dos Pinos 1L', cantidad: 30, motivo: 'SEED-ENTRY-MIX-01 Entrada lacteos' },
      { productName: 'Yogurt Griego 200g', cantidad: 50, motivo: 'SEED-ENTRY-MIX-02 Reposicion yogurt' },
    ],
    outputs: [
      { productName: 'Queso Fresco Libra', cantidad: 10, motivo: 'SEED-OUTPUT-MIX-01 Venta mostrador' },
      { productName: 'Mantequilla 200g', cantidad: 15, motivo: 'SEED-OUTPUT-MIX-02 Venta mayoreo' },
    ],
  },
  {
    warehouseName: 'Sucursal Antigua',
    products: [
      { nombre: 'Alambre Galvanizado #18', categoria: 'Alambres', precio: 35, existencia: 100, stockMinimo: 20 },
      { nombre: 'Alambre de Puas Rollo 50m', categoria: 'Alambres', precio: 280, existencia: 12, stockMinimo: 4 },
      { nombre: 'Cable Electrico 12 AWG metro', categoria: 'Alambres', precio: 4.5, existencia: 500, stockMinimo: 100 },
      { nombre: 'Clavos 2 pulgadas caja', categoria: 'Ferreteria', precio: 22, existencia: 75, stockMinimo: 15 },
      { nombre: 'Tornillo Drywall x100', categoria: 'Ferreteria', precio: 18, existencia: 90, stockMinimo: 20 },
    ],
    entries: [
      { productName: 'Alambre Galvanizado #18', cantidad: 40, motivo: 'SEED-ENTRY-ANT-01 Compra alambres' },
      { productName: 'Cable Electrico 12 AWG metro', cantidad: 200, motivo: 'SEED-ENTRY-ANT-02 Entrada cable' },
    ],
    outputs: [
      { productName: 'Alambre de Puas Rollo 50m', cantidad: 2, motivo: 'SEED-OUTPUT-ANT-01 Venta construccion' },
      { productName: 'Clavos 2 pulgadas caja', cantidad: 12, motivo: 'SEED-OUTPUT-ANT-02 Venta ferreteria' },
    ],
  },
  {
    warehouseName: 'Pamp',
    products: [
      { nombre: 'Agua Purificada 1L', categoria: 'Bebidas', precio: 6, existencia: 120, stockMinimo: 30 },
      { nombre: 'Gaseosa Cola 2L', categoria: 'Bebidas', precio: 14, existencia: 80, stockMinimo: 20 },
      { nombre: 'Papas Fritas Familiar', categoria: 'Snacks', precio: 18, existencia: 65, stockMinimo: 15 },
      { nombre: 'Galletas Surtidas', categoria: 'Snacks', precio: 9, existencia: 95, stockMinimo: 25 },
      { nombre: 'Cafe Molido 500g', categoria: 'Despensa', precio: 32, existencia: 40, stockMinimo: 10 },
    ],
    entries: [
      { productName: 'Agua Purificada 1L', cantidad: 50, motivo: 'SEED-ENTRY-PAMP-01 Reposicion bebidas' },
      { productName: 'Papas Fritas Familiar', cantidad: 25, motivo: 'SEED-ENTRY-PAMP-02 Entrada snacks' },
    ],
    outputs: [
      { productName: 'Gaseosa Cola 2L', cantidad: 12, motivo: 'SEED-OUTPUT-PAMP-01 Venta mostrador' },
      { productName: 'Cafe Molido 500g', cantidad: 6, motivo: 'SEED-OUTPUT-PAMP-02 Venta despensa' },
    ],
  },
];

const ALL_CATALOG_PRODUCTS = WAREHOUSE_CATALOGS.flatMap((catalog) => catalog.products);

const WAREHOUSE_SUPPLIERS = [
  {
    warehouseName: 'Sucursal Zona 10',
    supplier: {
      nombre: 'TechSupply Guatemala',
      contacto: 'Carlos Mendez',
      email: 'ventas@techsupply.gt',
      telefono: '502-555-0101',
      categorias: ['Computadoras', 'Accesorios PC'],
    },
  },
  {
    warehouseName: 'Sucursal Mixco',
    supplier: {
      nombre: 'Lacteos del Valle',
      contacto: 'Ana Recinos',
      email: 'pedidos@lacteosvalle.gt',
      telefono: '502-555-0202',
      categorias: ['Lacteos'],
    },
  },
  {
    warehouseName: 'Sucursal Antigua',
    supplier: {
      nombre: 'Ferreteria El Constructor',
      contacto: 'Jorge Ruiz',
      email: 'ventas@constructor.gt',
      telefono: '502-555-0303',
      categorias: ['Alambres', 'Ferreteria'],
    },
  },
  {
    warehouseName: 'Pamp',
    supplier: {
      nombre: 'Distribuidora Pamp',
      contacto: 'Luis Ortega',
      email: 'ventas@pamp.gt',
      telefono: '502-555-0404',
      categorias: ['Bebidas', 'Snacks', 'Despensa'],
    },
  },
];

const PURCHASE_ORDERS = [
  {
    supplierName: 'TechSupply Guatemala',
    warehouseName: 'Sucursal Zona 10',
    notas: 'SEED-OC-Z10-01 Pedido computadoras',
    estado: 'borrador',
    items: [
      { productName: 'Mouse Logitech M185', cantidad: 15, precioUnitario: 18 },
      { productName: 'Cable HDMI 2m', cantidad: 20, precioUnitario: 8 },
    ],
  },
  {
    supplierName: 'Lacteos del Valle',
    warehouseName: 'Sucursal Mixco',
    notas: 'SEED-OC-MIX-01 Pedido lacteos semana',
    estado: 'borrador',
    items: [
      { productName: 'Leche Entera Dos Pinos 1L', cantidad: 40, precioUnitario: 9 },
      { productName: 'Yogurt Griego 200g', cantidad: 60, precioUnitario: 6 },
    ],
  },
  {
    supplierName: 'Ferreteria El Constructor',
    warehouseName: 'Sucursal Antigua',
    notas: 'SEED-OC-ANT-01 Pedido alambres',
    estado: 'borrador',
    items: [
      { productName: 'Alambre Galvanizado #18', cantidad: 30, precioUnitario: 28 },
      { productName: 'Tornillo Drywall x100', cantidad: 25, precioUnitario: 14 },
    ],
  },
  {
    supplierName: 'Distribuidora Pamp',
    warehouseName: 'Pamp',
    notas: 'SEED-OC-PAMP-01 Pedido abarrotes',
    estado: 'borrador',
    items: [
      { productName: 'Agua Purificada 1L', cantidad: 60, precioUnitario: 4.5 },
      { productName: 'Galletas Surtidas', cantidad: 40, precioUnitario: 7 },
    ],
  },
];

const WAREHOUSE_CUSTOMERS = [
  {
    warehouseName: 'Sucursal Zona 10',
    customer: {
      nombre: 'Comercial El Faro',
      email: 'compras@elfaro.gt',
      telefono: '502-555-1101',
      nit: '1234567-8',
    },
  },
  {
    warehouseName: 'Sucursal Mixco',
    customer: {
      nombre: 'Distribuidora Norte',
      email: 'ventas@norte.gt',
      telefono: '502-555-1102',
      nit: '8765432-1',
    },
  },
  {
    warehouseName: 'Sucursal Antigua',
    customer: {
      nombre: 'Tienda Express',
      email: 'pedidos@express.gt',
      telefono: '502-555-1103',
      nit: '5566778-9',
    },
  },
  {
    warehouseName: 'Pamp',
    customer: {
      nombre: 'Minisuper Pamp',
      email: 'compras@minisuperpamp.gt',
      telefono: '502-555-1104',
      nit: '9988776-5',
    },
  },
];

const SALES = [
  {
    customerName: 'Comercial El Faro',
    warehouseName: 'Sucursal Zona 10',
    notas: 'SEED-VENTA-Z10-01 Pedido equipos',
    estado: 'borrador',
    items: [{ productName: 'Teclado Mecanico RGB', cantidad: 3, precioUnitario: 60 }],
  },
  {
    customerName: 'Distribuidora Norte',
    warehouseName: 'Sucursal Mixco',
    notas: 'SEED-VENTA-MIX-01 Pedido lacteos',
    estado: 'borrador',
    items: [{ productName: 'Crema de Leche 1L', cantidad: 10, precioUnitario: 16 }],
  },
  {
    customerName: 'Tienda Express',
    warehouseName: 'Sucursal Antigua',
    notas: 'SEED-VENTA-ANT-01 Pedido ferreteria',
    estado: 'borrador',
    items: [{ productName: 'Clavos 2 pulgadas caja', cantidad: 8, precioUnitario: 20 }],
  },
  {
    customerName: 'Minisuper Pamp',
    warehouseName: 'Pamp',
    notas: 'SEED-VENTA-PAMP-01 Pedido abarrotes',
    estado: 'borrador',
    items: [{ productName: 'Galletas Surtidas', cantidad: 15, precioUnitario: 8 }],
  },
];

const WAREHOUSES = [
  {
    nombre: 'Central',
    direccion: 'Vista consolidada — todas las sucursales',
    lat: 14.6349,
    lng: -90.5069,
    esCentral: true,
  },
  {
    nombre: 'Sucursal Zona 10',
    direccion: 'Zona 10, Ciudad de Guatemala',
    lat: 14.6019,
    lng: -90.5069,
  },
  {
    nombre: 'Sucursal Mixco',
    direccion: 'Mixco, Guatemala',
    lat: 14.6333,
    lng: -90.6064,
  },
  {
    nombre: 'Sucursal Antigua',
    direccion: 'Antigua Guatemala, Sacatepéquez',
    lat: 14.5586,
    lng: -90.7335,
  },
];

async function seedStockMinimo() {
  const defaultsByName = Object.fromEntries(
    ALL_CATALOG_PRODUCTS.map((product) => [product.nombre, product.stockMinimo ?? 5])
  );
  const products = await Product.find({ nombre: { $in: Object.keys(defaultsByName) } });

  let updated = 0;

  for (const product of products) {
    const targetMin = defaultsByName[product.nombre] ?? 5;

    if (product.stockMinimo !== targetMin) {
      product.stockMinimo = targetMin;
      await product.save();
      updated += 1;
    }
  }

  return updated;
}

async function seedProducts() {
  let created = 0;

  for (const productData of ALL_CATALOG_PRODUCTS) {
    const exists = await Product.findOne({ nombre: productData.nombre });

    if (exists) {
      continue;
    }

    await Product.create({
      ...productData,
      existencia: 0,
    });
    created += 1;
  }

  return created;
}

async function seedWarehouseMovements() {
  let created = 0;

  for (const catalog of WAREHOUSE_CATALOGS) {
    const warehouse = await Warehouse.findOne({ nombre: catalog.warehouseName });

    if (!warehouse) {
      continue;
    }

    for (const entryData of catalog.entries || []) {
      const exists = await Entry.findOne({ motivo: entryData.motivo });

      if (exists) {
        continue;
      }

      const product = await Product.findOne({ nombre: entryData.productName });

      if (!product) {
        console.warn(`[inventory-service] Producto no encontrado para entrada: ${entryData.productName}`);
        continue;
      }

      await Entry.create({
        productId: product._id,
        warehouseId: warehouse._id,
        cantidad: entryData.cantidad,
        motivo: entryData.motivo,
        registradoPor: 'seed',
      });

      created += 1;
    }

    for (const outputData of catalog.outputs || []) {
      const exists = await Output.findOne({ motivo: outputData.motivo });

      if (exists) {
        continue;
      }

      const product = await Product.findOne({ nombre: outputData.productName });

      if (!product) {
        console.warn(`[inventory-service] Producto no encontrado para salida: ${outputData.productName}`);
        continue;
      }

      await Output.create({
        productId: product._id,
        warehouseId: warehouse._id,
        cantidad: outputData.cantidad,
        motivo: outputData.motivo,
        registradoPor: 'seed',
      });

      created += 1;
    }
  }

  return created;
}

async function seedSuppliers() {
  let created = 0;

  await Supplier.deleteMany({
    $or: [{ warehouseId: { $exists: false } }, { warehouseId: null }],
  });

  for (const entry of WAREHOUSE_SUPPLIERS) {
    const warehouse = await Warehouse.findOne({
      nombre: entry.warehouseName,
      esCentral: { $ne: true },
    });

    if (!warehouse) {
      console.warn(`[inventory-service] Bodega no encontrada para proveedor: ${entry.warehouseName}`);
      continue;
    }

    const exists = await Supplier.findOne({
      nombre: entry.supplier.nombre,
      warehouseId: warehouse._id,
    });

    if (exists) {
      continue;
    }

    await Supplier.create({
      ...entry.supplier,
      warehouseId: warehouse._id,
    });
    created += 1;
  }

  return created;
}

async function seedPurchaseOrders() {
  let created = 0;

  for (const orderData of PURCHASE_ORDERS) {
    const exists = await PurchaseOrder.findOne({ notas: orderData.notas });

    if (exists) {
      continue;
    }

    const warehouse = await Warehouse.findOne({ nombre: orderData.warehouseName || 'Sucursal Zona 10' });

    if (!warehouse) {
      console.warn(`[inventory-service] Bodega no encontrada para OC: ${orderData.warehouseName}`);
      continue;
    }

    const supplier = await Supplier.findOne({
      nombre: orderData.supplierName,
      warehouseId: warehouse._id,
    });

    if (!supplier) {
      console.warn(`[inventory-service] Proveedor no encontrado para OC: ${orderData.supplierName}`);
      continue;
    }

    const items = [];

    for (const itemData of orderData.items) {
      const product = await Product.findOne({ nombre: itemData.productName });

      if (!product) {
        console.warn(`[inventory-service] Producto no encontrado para OC: ${itemData.productName}`);
        continue;
      }

      items.push({
        productId: product._id,
        cantidad: itemData.cantidad,
        precioUnitario: itemData.precioUnitario,
      });
    }

    if (items.length === 0) {
      continue;
    }

    await PurchaseOrder.create({
      supplierId: supplier._id,
      warehouseId: warehouse._id,
      items,
      notas: orderData.notas,
      estado: orderData.estado,
      creadoPor: 'seed',
    });

    created += 1;
  }

  return created;
}

async function seedCustomers() {
  let created = 0;

  await Customer.deleteMany({
    $or: [{ warehouseId: { $exists: false } }, { warehouseId: null }],
  });

  for (const entry of WAREHOUSE_CUSTOMERS) {
    const warehouse = await Warehouse.findOne({
      nombre: entry.warehouseName,
      esCentral: { $ne: true },
    });

    if (!warehouse) {
      console.warn(`[inventory-service] Bodega no encontrada para cliente: ${entry.warehouseName}`);
      continue;
    }

    const exists = await Customer.findOne({
      nombre: entry.customer.nombre,
      warehouseId: warehouse._id,
    });

    if (exists) {
      continue;
    }

    await Customer.create({
      ...entry.customer,
      warehouseId: warehouse._id,
    });
    created += 1;
  }

  return created;
}

async function seedSales() {
  let created = 0;

  for (const saleData of SALES) {
    const exists = await Sale.findOne({ notas: saleData.notas });

    if (exists) {
      continue;
    }

    const warehouse = await Warehouse.findOne({ nombre: saleData.warehouseName || 'Sucursal Mixco' });

    if (!warehouse) {
      console.warn(`[inventory-service] Bodega no encontrada para venta: ${saleData.warehouseName}`);
      continue;
    }

    const customer = await Customer.findOne({
      nombre: saleData.customerName,
      warehouseId: warehouse._id,
    });

    if (!customer) {
      console.warn(`[inventory-service] Cliente no encontrado para venta: ${saleData.customerName}`);
      continue;
    }

    const items = [];

    for (const itemData of saleData.items) {
      const product = await Product.findOne({ nombre: itemData.productName });

      if (!product) {
        console.warn(`[inventory-service] Producto no encontrado para venta: ${itemData.productName}`);
        continue;
      }

      items.push({
        productId: product._id,
        cantidad: itemData.cantidad,
        precioUnitario: itemData.precioUnitario,
      });
    }

    if (items.length === 0) {
      continue;
    }

    await Sale.create({
      customerId: customer._id,
      warehouseId: warehouse._id,
      items,
      notas: saleData.notas,
      estado: saleData.estado,
      creadoPor: 'seed',
    });

    created += 1;
  }

  return created;
}

async function seedWarehouses() {
  let created = 0;

  const legacyBranch = await Warehouse.findOne({ nombre: 'Bodega Central Zona 10' });

  if (legacyBranch && !legacyBranch.esCentral) {
    legacyBranch.nombre = 'Sucursal Zona 10';
    await legacyBranch.save();
  }

  for (const warehouseData of WAREHOUSES) {
    const exists = await Warehouse.findOne({ nombre: warehouseData.nombre });

    if (exists) {
      let changed = false;

      if (warehouseData.esCentral && !exists.esCentral) {
        exists.esCentral = true;
        changed = true;
      }

      if (exists.direccion !== warehouseData.direccion) {
        exists.direccion = warehouseData.direccion;
        changed = true;
      }

      if (exists.lat !== warehouseData.lat) {
        exists.lat = warehouseData.lat;
        changed = true;
      }

      if (exists.lng !== warehouseData.lng) {
        exists.lng = warehouseData.lng;
        changed = true;
      }

      if (changed) {
        await exists.save();
      }

      continue;
    }

    await Warehouse.create(warehouseData);
    created += 1;
  }

  const central = await Warehouse.findOne({ esCentral: true });

  if (central) {
    await WarehouseStock.deleteMany({ warehouseId: central._id });
  }

  const zonaBranches = await Warehouse.find({ nombre: 'Sucursal Zona 10', esCentral: { $ne: true } }).sort({
    createdAt: 1,
  });

  if (zonaBranches.length > 1) {
    const [primary, ...duplicates] = zonaBranches;

    for (const duplicate of duplicates) {
      await WarehouseStock.updateMany({ warehouseId: duplicate._id }, { warehouseId: primary._id });
      await Entry.updateMany({ warehouseId: duplicate._id }, { warehouseId: primary._id });
      await Output.updateMany({ warehouseId: duplicate._id }, { warehouseId: primary._id });
      await PurchaseOrder.updateMany({ warehouseId: duplicate._id }, { warehouseId: primary._id });
      await Sale.updateMany({ warehouseId: duplicate._id }, { warehouseId: primary._id });
      await Warehouse.findByIdAndDelete(duplicate._id);
    }
  }

  return created;
}

async function seedWarehouseStock() {
  const warehouses = await Warehouse.find().sort({ nombre: 1 });

  if (warehouses.length === 0) {
    return 0;
  }

  const catalogProductIds = new Set();
  let updated = 0;

  await WarehouseStock.deleteMany({});

  for (const catalog of WAREHOUSE_CATALOGS) {
    const warehouse = warehouses.find(
      (item) => item.nombre === catalog.warehouseName && !item.esCentral
    );

    if (!warehouse) {
      console.warn(`[inventory-service] Bodega no encontrada para catalogo: ${catalog.warehouseName}`);
      continue;
    }

    for (const productData of catalog.products) {
      const product = await Product.findOne({ nombre: productData.nombre });

      if (!product) {
        console.warn(`[inventory-service] Producto no encontrado para stock: ${productData.nombre}`);
        continue;
      }

      await WarehouseStock.findOneAndUpdate(
        { productId: product._id, warehouseId: warehouse._id },
        { existencia: productData.existencia },
        { upsert: true, new: true, runValidators: true }
      );

      catalogProductIds.add(String(product._id));
      updated += 1;
      await syncProductTotal(product._id);
    }
  }

  const defaultWarehouseId = warehouses[0]._id;

  await Entry.updateMany({ warehouseId: { $exists: false } }, { warehouseId: defaultWarehouseId });
  await Output.updateMany({ warehouseId: { $exists: false } }, { warehouseId: defaultWarehouseId });
  await PurchaseOrder.updateMany({ warehouseId: { $exists: false } }, { warehouseId: defaultWarehouseId });
  await Sale.updateMany(
    { warehouseId: { $exists: false } },
    { warehouseId: warehouses[1]?._id || defaultWarehouseId }
  );

  return updated;
}

export const seedInventory = async () => {
  if (!shouldRunSeed()) {
    return { skipped: true };
  }

  const productsCreated = await seedProducts();
  const stockMinimoUpdated = await seedStockMinimo();
  const warehousesCreated = await seedWarehouses();
  const suppliersCreated = await seedSuppliers();
  const warehouseStockSynced = await seedWarehouseStock();
  const movementsCreated = await seedWarehouseMovements();
  const customersCreated = await seedCustomers();
  const purchaseOrdersCreated = await seedPurchaseOrders();
  const salesCreated = await seedSales();
  const historical = await seedHistoricalData(WAREHOUSE_CATALOGS);

  const [products, entries, outputs, suppliers, purchaseOrders, customers, sales, warehouses] = await Promise.all([
    Product.countDocuments(),
    Entry.countDocuments(),
    Output.countDocuments(),
    Supplier.countDocuments(),
    PurchaseOrder.countDocuments(),
    Customer.countDocuments(),
    Sale.countDocuments(),
    Warehouse.countDocuments(),
  ]);

  console.log(`[inventory-service] Productos: ${products} (nuevos: ${productsCreated}, stockMinimo sync: ${stockMinimoUpdated})`);
  console.log(`[inventory-service] Movimientos seed: ${movementsCreated} (entradas: ${entries}, salidas: ${outputs})`);
  console.log(`[inventory-service] Proveedores: ${suppliers} (nuevos: ${suppliersCreated})`);
  console.log(`[inventory-service] Ordenes de compra: ${purchaseOrders} (nuevas: ${purchaseOrdersCreated})`);
  console.log(`[inventory-service] Clientes: ${customers} (nuevos: ${customersCreated})`);
  console.log(`[inventory-service] Ventas: ${sales} (nuevas: ${salesCreated})`);
  console.log(`[inventory-service] Bodegas: ${warehouses} (nuevas: ${warehousesCreated}, stock sync: ${warehouseStockSynced})`);
  if (!historical.skipped) {
    console.log(
      `[inventory-service] Historico ~3 meses: +${historical.movements} movimientos, +${historical.sales} ventas, +${historical.purchaseOrders} OC`
    );
  }

  return {
    products,
    entries,
    outputs,
    suppliers,
    purchaseOrders,
    customers,
    sales,
    warehouses,
    productsCreated,
    stockMinimoUpdated,
    movementsCreated,
    suppliersCreated,
    purchaseOrdersCreated,
    customersCreated,
    salesCreated,
    warehousesCreated,
    warehouseStockSynced,
    historical,
  };
};

export default seedInventory;
