import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import { shouldRunSeed } from './seedUtils.js';

const PRODUCTS = [
  { nombre: 'Laptop Dell Inspiron', categoria: 'Electronica', precio: 800, existencia: 15 },
  { nombre: 'Mouse Logitech M185', categoria: 'Electronica', precio: 25, existencia: 50 },
  { nombre: 'Teclado Mecanico RGB', categoria: 'Electronica', precio: 65, existencia: 30 },
  { nombre: 'Monitor Samsung 24"', categoria: 'Electronica', precio: 220, existencia: 8 },
  { nombre: 'Escritorio Ergonomico', categoria: 'Muebles', precio: 180, existencia: 5 },
  { nombre: 'Silla de Oficina', categoria: 'Muebles', precio: 120, existencia: 12 },
  { nombre: 'Cuaderno A4 100 hojas', categoria: 'Papeleria', precio: 3, existencia: 100 },
  { nombre: 'Pack Boligrafos x12', categoria: 'Papeleria', precio: 5, existencia: 200 },
  { nombre: 'Toner HP 85A', categoria: 'Consumibles', precio: 45, existencia: 6 },
  { nombre: 'Cable HDMI 2m', categoria: 'Accesorios', precio: 12, existencia: 40 },
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

export const seedInventory = async () => {
  if (!shouldRunSeed()) {
    return { skipped: true };
  }

  const productsCreated = await seedProducts();
  const entriesCreated = await seedEntries();
  const outputsCreated = await seedOutputs();

  const [products, entries, outputs] = await Promise.all([
    Product.countDocuments(),
    Entry.countDocuments(),
    Output.countDocuments(),
  ]);

  console.log(`[inventory-service] Productos: ${products} (nuevos: ${productsCreated})`);
  console.log(`[inventory-service] Entradas: ${entries} (nuevas: ${entriesCreated})`);
  console.log(`[inventory-service] Salidas: ${outputs} (nuevas: ${outputsCreated})`);

  return {
    products,
    entries,
    outputs,
    productsCreated,
    entriesCreated,
    outputsCreated,
  };
};

export default seedInventory;
