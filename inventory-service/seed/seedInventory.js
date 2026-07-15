import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { shouldRunSeed } from './seedUtils.js';

const PRODUCTS = [
  { nombre: 'Laptop Dell Inspiron', categoria: 'Electronica', precio: 800, existencia: 15, stockMinimo: 5 },
  { nombre: 'Mouse Logitech M185', categoria: 'Electronica', precio: 25, existencia: 50, stockMinimo: 10 },
  { nombre: 'Teclado Mecanico RGB', categoria: 'Electronica', precio: 65, existencia: 30, stockMinimo: 8 },
  { nombre: 'Monitor Samsung 24"', categoria: 'Electronica', precio: 220, existencia: 8, stockMinimo: 10 },
  { nombre: 'Escritorio Ergonomico', categoria: 'Muebles', precio: 180, existencia: 5, stockMinimo: 3 },
  { nombre: 'Silla de Oficina', categoria: 'Muebles', precio: 120, existencia: 12, stockMinimo: 4 },
  { nombre: 'Cuaderno A4 100 hojas', categoria: 'Papeleria', precio: 3, existencia: 100, stockMinimo: 20 },
  { nombre: 'Pack Boligrafos x12', categoria: 'Papeleria', precio: 5, existencia: 200, stockMinimo: 30 },
  { nombre: 'Toner HP 85A', categoria: 'Consumibles', precio: 45, existencia: 6, stockMinimo: 8 },
  { nombre: 'Cable HDMI 2m', categoria: 'Accesorios', precio: 12, existencia: 40, stockMinimo: 15 },
];

const ENTRIES = [
  { productName: 'Laptop Dell Inspiron', cantidad: 5, motivo: 'SEED-ENTRY-01 Compra proveedor' },
  { productName: 'Mouse Logitech M185', cantidad: 20, motivo: 'SEED-ENTRY-02 Reposicion almacen' },
  { productName: 'Teclado Mecanico RGB', cantidad: 10, motivo: 'SEED-ENTRY-03 Compra mayoreo' },
  { productName: 'Monitor Samsung 24"', cantidad: 4, motivo: 'SEED-ENTRY-04 Entrada nueva linea' },
  { productName: 'Escritorio Ergonomico', cantidad: 3, motivo: 'SEED-ENTRY-05 Stock inicial' },
  { productName: 'Silla de Oficina', cantidad: 8, motivo: 'SEED-ENTRY-06 Compra local' },
  { productName: 'Cuaderno A4 100 hojas', cantidad: 50, motivo: 'SEED-ENTRY-07 Pedido papeleria' },
  { productName: 'Pack Boligrafos x12', cantidad: 100, motivo: 'SEED-ENTRY-08 Reposicion' },
  { productName: 'Toner HP 85A', cantidad: 4, motivo: 'SEED-ENTRY-09 Compra consumibles' },
  { productName: 'Cable HDMI 2m', cantidad: 25, motivo: 'SEED-ENTRY-10 Entrada accesorios' },
];

const OUTPUTS = [
  { productName: 'Laptop Dell Inspiron', cantidad: 2, motivo: 'SEED-OUTPUT-01 Venta mostrador' },
  { productName: 'Mouse Logitech M185', cantidad: 10, motivo: 'SEED-OUTPUT-02 Venta online' },
  { productName: 'Teclado Mecanico RGB', cantidad: 5, motivo: 'SEED-OUTPUT-03 Venta corporativa' },
  { productName: 'Monitor Samsung 24"', cantidad: 1, motivo: 'SEED-OUTPUT-04 Venta mostrador' },
  { productName: 'Escritorio Ergonomico', cantidad: 1, motivo: 'SEED-OUTPUT-05 Venta oficina' },
  { productName: 'Silla de Oficina', cantidad: 3, motivo: 'SEED-OUTPUT-06 Venta mostrador' },
  { productName: 'Cuaderno A4 100 hojas', cantidad: 20, motivo: 'SEED-OUTPUT-07 Venta escolar' },
  { productName: 'Pack Boligrafos x12', cantidad: 30, motivo: 'SEED-OUTPUT-08 Venta mayoreo' },
  { productName: 'Toner HP 85A', cantidad: 2, motivo: 'SEED-OUTPUT-09 Venta servicio' },
  { productName: 'Cable HDMI 2m', cantidad: 8, motivo: 'SEED-OUTPUT-10 Venta accesorios' },
];

const SUPPLIERS = [
  {
    nombre: 'TechSupply Guatemala',
    contacto: 'Carlos Mendez',
    email: 'ventas@techsupply.gt',
    telefono: '502-555-0101',
    categorias: ['Electronica', 'Accesorios'],
  },
  {
    nombre: 'Papeleria Central',
    contacto: 'Maria Lopez',
    email: 'pedidos@papeleria-central.gt',
    telefono: '502-555-0202',
    categorias: ['Papeleria'],
  },
  {
    nombre: 'Muebles Pro',
    contacto: 'Jorge Ruiz',
    email: 'compras@mueblespro.gt',
    telefono: '502-555-0303',
    categorias: ['Muebles'],
  },
];

const PURCHASE_ORDERS = [
  {
    supplierName: 'TechSupply Guatemala',
    notas: 'SEED-OC-01 Pedido electronica Q3',
    estado: 'borrador',
    items: [
      { productName: 'Mouse Logitech M185', cantidad: 15, precioUnitario: 18 },
      { productName: 'Cable HDMI 2m', cantidad: 20, precioUnitario: 8 },
    ],
  },
];

async function seedStockMinimo() {
  const defaultsByName = Object.fromEntries(PRODUCTS.map((p) => [p.nombre, p.stockMinimo ?? 5]));
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

  for (const productData of PRODUCTS) {
    const exists = await Product.findOne({ nombre: productData.nombre });

    if (exists) {
      continue;
    }

    await Product.create(productData);
    created += 1;
  }

  return created;
}

async function seedEntries() {
  let created = 0;

  for (const entryData of ENTRIES) {
    const exists = await Entry.findOne({ motivo: entryData.motivo });

    if (exists) {
      continue;
    }

    const product = await Product.findOne({ nombre: entryData.productName });

    if (!product) {
      console.warn(`[inventory-service] Producto no encontrado para entrada: ${entryData.productName}`);
      continue;
    }

    product.existencia += entryData.cantidad;
    await product.save();

    await Entry.create({
      productId: product._id,
      cantidad: entryData.cantidad,
      motivo: entryData.motivo,
    });

    created += 1;
  }

  return created;
}

async function seedOutputs() {
  let created = 0;

  for (const outputData of OUTPUTS) {
    const exists = await Output.findOne({ motivo: outputData.motivo });

    if (exists) {
      continue;
    }

    const product = await Product.findOne({ nombre: outputData.productName });

    if (!product) {
      console.warn(`[inventory-service] Producto no encontrado para salida: ${outputData.productName}`);
      continue;
    }

    if (product.existencia < outputData.cantidad) {
      console.warn(`[inventory-service] Stock insuficiente para seed salida: ${outputData.productName}`);
      continue;
    }

    product.existencia -= outputData.cantidad;
    await product.save();

    await Output.create({
      productId: product._id,
      cantidad: outputData.cantidad,
      motivo: outputData.motivo,
    });

    created += 1;
  }

  return created;
}

async function seedSuppliers() {
  let created = 0;

  for (const supplierData of SUPPLIERS) {
    const exists = await Supplier.findOne({ nombre: supplierData.nombre });

    if (exists) {
      continue;
    }

    await Supplier.create(supplierData);
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

    const supplier = await Supplier.findOne({ nombre: orderData.supplierName });

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
      items,
      notas: orderData.notas,
      estado: orderData.estado,
      creadoPor: 'seed',
    });

    created += 1;
  }

  return created;
}

export const seedInventory = async () => {
  if (!shouldRunSeed()) {
    return { skipped: true };
  }

  const productsCreated = await seedProducts();
  const stockMinimoUpdated = await seedStockMinimo();
  const entriesCreated = await seedEntries();
  const outputsCreated = await seedOutputs();
  const suppliersCreated = await seedSuppliers();
  const purchaseOrdersCreated = await seedPurchaseOrders();

  const [products, entries, outputs, suppliers, purchaseOrders] = await Promise.all([
    Product.countDocuments(),
    Entry.countDocuments(),
    Output.countDocuments(),
    Supplier.countDocuments(),
    PurchaseOrder.countDocuments(),
  ]);

  console.log(`[inventory-service] Productos: ${products} (nuevos: ${productsCreated}, stockMinimo sync: ${stockMinimoUpdated})`);
  console.log(`[inventory-service] Entradas: ${entries} (nuevas: ${entriesCreated})`);
  console.log(`[inventory-service] Salidas: ${outputs} (nuevas: ${outputsCreated})`);
  console.log(`[inventory-service] Proveedores: ${suppliers} (nuevos: ${suppliersCreated})`);
  console.log(`[inventory-service] Ordenes de compra: ${purchaseOrders} (nuevas: ${purchaseOrdersCreated})`);

  return {
    products,
    entries,
    outputs,
    suppliers,
    purchaseOrders,
    productsCreated,
    stockMinimoUpdated,
    entriesCreated,
    outputsCreated,
    suppliersCreated,
    purchaseOrdersCreated,
  };
};

export default seedInventory;
