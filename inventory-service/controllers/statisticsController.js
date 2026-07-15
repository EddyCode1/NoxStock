import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import {
  attachWarehouseStock,
  getAggregatedStockMap,
  getAllBranchCatalogProductIds,
  getCatalogProductIds,
  getStockMapForWarehouse,
} from '../helpers/warehouseStock.js';
import {
  buildWarehouseScopeFilter,
  ensureWarehouseExists,
  isCentralWarehouse,
  requireWarehouseId,
} from '../helpers/warehouseContext.js';
import { successResponse, errorResponse } from '../helpers/response.js';

const DEFAULT_LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 10);
const DAYS_RANGE = 7;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDayLabel = (date) =>
  date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').slice(0, 3);

const buildLastNDays = (n) => {
  const days = [];
  const today = startOfDay(new Date());

  for (let i = n - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    days.push(day);
  }

  return days;
};

const getMinStock = (product) => product.stockMinimo ?? DEFAULT_LOW_STOCK_THRESHOLD;

const buildScopedProducts = async (warehouseId, centralView) => {
  const catalogProductIds = centralView
    ? await getAllBranchCatalogProductIds()
    : await getCatalogProductIds(warehouseId);

  if (catalogProductIds.length === 0) {
    return [];
  }

  const products = await Product.find({ _id: { $in: catalogProductIds } }).lean();
  const stockMap = centralView
    ? await getAggregatedStockMap(catalogProductIds)
    : await getStockMapForWarehouse(warehouseId, catalogProductIds);

  return attachWarehouseStock(products, stockMap, warehouseId);
};

const buildEmptyPayload = (warehouse, centralView) => ({
  warehouse: {
    _id: warehouse._id,
    nombre: warehouse.nombre,
    esCentral: centralView,
  },
  vistaConsolidada: centralView,
  resumen: {
    totalProductos: 0,
    stockDisponible: 0,
    bajoStock: 0,
    sinStock: 0,
  },
  gananciaPorCategoria: {
    totalValorEstimado: 0,
    categorias: [],
  },
  resumenOrdenes: {
    totalSemana: 0,
    serie: buildLastNDays(DAYS_RANGE).map((d) => ({
      fecha: d.toISOString().slice(0, 10),
      dia: formatDayLabel(d),
      total: 0,
    })),
  },
  movimientosPorCategoria: [],
  nivelStock: {
    porcentaje: 0,
    totalStock: 0,
    productos: [],
  },
  proximoReabastecimiento: [],
  productos: [],
});

/**
 * GET /statistics?warehouseId=...
 * Métricas del dashboard filtradas por sucursal.
 * Central = vista consolidada (suma de todas las sucursales operativas).
 */
export const getStatistics = async (req, res, next) => {
  try {
    const warehouseId = requireWarehouseId(req, res);
    if (!warehouseId) return;

    const warehouse = await ensureWarehouseExists(warehouseId);
    if (!warehouse) {
      return errorResponse(res, 404, 'Bodega no encontrada', 'WAREHOUSE_NOT_FOUND');
    }

    const centralView = await isCentralWarehouse(warehouseId);
    const products = await buildScopedProducts(warehouseId, centralView);

    if (products.length === 0) {
      return successResponse(res, 200, 'Estadísticas obtenidas correctamente', buildEmptyPayload(warehouse, centralView));
    }

    const totalProducts = products.length;
    const availableStock = products.reduce((sum, p) => sum + (p.existencia || 0), 0);
    const lowStockProducts = products.filter(
      (p) => p.existencia > 0 && p.existencia <= getMinStock(p)
    );
    const outOfStockProducts = products.filter((p) => p.existencia === 0);

    const categoryMap = new Map();
    for (const product of products) {
      const categoria = product.categoria || 'Sin categoría';
      const current = categoryMap.get(categoria) || {
        categoria,
        totalProductos: 0,
        totalExistencia: 0,
        valorEstimado: 0,
      };

      current.totalProductos += 1;
      current.totalExistencia += product.existencia || 0;
      current.valorEstimado += (product.existencia || 0) * (product.precio || 0);

      categoryMap.set(categoria, current);
    }

    const categorias = [...categoryMap.values()].sort((a, b) => b.valorEstimado - a.valorEstimado);
    const totalValorEstimado = categorias.reduce((sum, c) => sum + c.valorEstimado, 0);

    const categoriasConPorcentaje = categorias.map((c) => ({
      ...c,
      porcentaje:
        totalValorEstimado > 0 ? Number(((c.valorEstimado / totalValorEstimado) * 100).toFixed(1)) : 0,
    }));

    const days = buildLastNDays(DAYS_RANGE);
    const rangeStart = days[0];
    const movementScope = await buildWarehouseScopeFilter(warehouseId);

    const [entriesInRange, outputsInRange] = await Promise.all([
      Entry.find({ fecha: { $gte: rangeStart }, ...movementScope })
        .populate('productId', 'precio categoria')
        .lean(),
      Output.find({ fecha: { $gte: rangeStart }, ...movementScope })
        .populate('productId', 'precio categoria')
        .lean(),
    ]);

    const dayKey = (date) => startOfDay(date).getTime();
    const dailyTotals = new Map(days.map((d) => [dayKey(d), 0]));

    for (const entry of entriesInRange) {
      const key = dayKey(entry.fecha);
      if (dailyTotals.has(key)) {
        const valor = (entry.cantidad || 0) * (entry.productId?.precio || 0);
        dailyTotals.set(key, dailyTotals.get(key) + valor);
      }
    }

    for (const output of outputsInRange) {
      const key = dayKey(output.fecha);
      if (dailyTotals.has(key)) {
        const valor = (output.cantidad || 0) * (output.productId?.precio || 0);
        dailyTotals.set(key, dailyTotals.get(key) + valor);
      }
    }

    const resumenOrdenes = days.map((d) => ({
      fecha: d.toISOString().slice(0, 10),
      dia: formatDayLabel(d),
      total: Number((dailyTotals.get(dayKey(d)) || 0).toFixed(2)),
    }));

    const totalMovimientoSemana = resumenOrdenes.reduce((sum, d) => sum + d.total, 0);

    const movCategoriaMap = new Map();

    for (const entry of entriesInRange) {
      const categoria = entry.productId?.categoria || 'Sin categoría';
      const current = movCategoriaMap.get(categoria) || { categoria, entradas: 0, salidas: 0 };
      current.entradas += entry.cantidad || 0;
      movCategoriaMap.set(categoria, current);
    }

    for (const output of outputsInRange) {
      const categoria = output.productId?.categoria || 'Sin categoría';
      const current = movCategoriaMap.get(categoria) || { categoria, entradas: 0, salidas: 0 };
      current.salidas += output.cantidad || 0;
      movCategoriaMap.set(categoria, current);
    }

    const movimientosPorCategoria = [...movCategoriaMap.values()]
      .map((item) => ({ ...item, total: item.entradas + item.salidas }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const totalMovimientosCategoria = movimientosPorCategoria.reduce((sum, c) => sum + c.total, 0) || 1;
    const movimientosPorCategoriaConPorcentaje = movimientosPorCategoria.map((c) => ({
      ...c,
      porcentaje: Number(((c.total / totalMovimientosCategoria) * 100).toFixed(1)),
    }));

    const proximoReabastecimiento = [...products]
      .filter((p) => p.existencia <= getMinStock(p))
      .sort((a, b) => a.existencia - b.existencia)
      .slice(0, 6)
      .map((p) => ({
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria,
        existencia: p.existencia,
        precio: p.precio,
      }));

    const stockMaximoReferencia = products.reduce(
      (sum, p) => sum + Math.max(p.existencia, getMinStock(p) * 2),
      0
    );
    const stockLevelPorcentaje =
      stockMaximoReferencia > 0
        ? Number(((availableStock / stockMaximoReferencia) * 100).toFixed(1))
        : 0;

    const nivelStockProductos = [...products]
      .sort((a, b) => a.existencia - b.existencia)
      .slice(0, 5)
      .map((p) => {
        const referencia = Math.max(p.existencia, getMinStock(p) * 2, 1);
        return {
          _id: p._id,
          nombre: p.nombre,
          existencia: p.existencia,
          referencia,
          porcentaje: Number(((p.existencia / referencia) * 100).toFixed(1)),
        };
      });

    return successResponse(res, 200, 'Estadísticas obtenidas correctamente', {
      warehouse: {
        _id: warehouse._id,
        nombre: warehouse.nombre,
        esCentral: centralView,
      },
      vistaConsolidada: centralView,
      resumen: {
        totalProductos: totalProducts,
        stockDisponible: availableStock,
        bajoStock: lowStockProducts.length,
        sinStock: outOfStockProducts.length,
      },
      gananciaPorCategoria: {
        totalValorEstimado: Number(totalValorEstimado.toFixed(2)),
        categorias: categoriasConPorcentaje,
      },
      resumenOrdenes: {
        totalSemana: Number(totalMovimientoSemana.toFixed(2)),
        serie: resumenOrdenes,
      },
      movimientosPorCategoria: movimientosPorCategoriaConPorcentaje,
      nivelStock: {
        porcentaje: stockLevelPorcentaje,
        totalStock: availableStock,
        productos: nivelStockProductos,
      },
      proximoReabastecimiento,
      productos: products.slice(0, 10).map((p) => ({
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        existencia: p.existencia,
        estado:
          p.existencia === 0
            ? 'Sin stock'
            : p.existencia <= getMinStock(p)
              ? 'Bajo stock'
              : 'Disponible',
      })),
    });
  } catch (error) {
    next(error);
  }
};

export default getStatistics;
