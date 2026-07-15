import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import Sale from '../models/Sale.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Warehouse from '../models/Warehouse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await connectDB();

const warehouses = await Warehouse.find({ esCentral: { $ne: true } }).lean();

for (const wh of warehouses) {
  const [entries, outputs, sales, orders] = await Promise.all([
    Entry.countDocuments({ warehouseId: wh._id }),
    Output.countDocuments({ warehouseId: wh._id }),
    Sale.countDocuments({ warehouseId: wh._id }),
    PurchaseOrder.countDocuments({ warehouseId: wh._id }),
  ]);

  const oldest = await Entry.findOne({ warehouseId: wh._id }).sort({ fecha: 1 }).select('fecha');
  const newest = await Entry.findOne({ warehouseId: wh._id }).sort({ fecha: -1 }).select('fecha');

  console.log(wh.nombre, {
    entries,
    outputs,
    sales,
    orders,
    desde: oldest?.fecha?.toISOString?.()?.slice(0, 10),
    hasta: newest?.fecha?.toISOString?.()?.slice(0, 10),
  });
}

process.exit(0);
