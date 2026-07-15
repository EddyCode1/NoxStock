import Product from '../models/Product.js';
import Entry from '../models/Entry.js';
import Output from '../models/Output.js';
import { successResponse } from '../helpers/response.js';

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 10);
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

/**
 * GET /statistics
 * Devuelve las métricas clave del dashboard:
 * - Totales de productos, stock disponible, bajo stock y sin stock
 * - Agrupación de productos por categoría (para gráfico de dona)
 * - Serie de movimientos (entradas + salidas) de los últimos 7 días (para gráfico de línea)
 * - Movimientos de entradas/salidas agrupados por categoría (para panel lateral)
 * - Listado de productos con bajo stock ordenado (para "Próximo Reabastecimiento")
 */
export const getStatistics = async (req, res, next) => {
  try {
    const products = await Product.find().lean();

    const totalProducts = products.length;
    const availableStock = products.reduce((sum, p) => sum + (p.existencia || 0), 0);
    const lowStockProducts = products.filter(
      (p) => p.existencia > 0 && p.existencia <= LOW_STOCK_THRESHOLD
    );
    const outOfStockProducts = products.filter((p) => p.existencia === 0);

    // Agrupación por categoría (gráfico de dona - "Ganancia por Categoría")
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

    // Serie de movimientos de los últimos 7 días (gráfico de línea - "Resumen de Órdenes")
    const days = buildLastNDays(DAYS_RANGE);
    const rangeStart = days[0];

    const [entriesInRange, outputsInRange] = await Promise.all([
      Entry.find({ fecha: { $gte: rangeStart } }).populate('productId', 'precio categoria').lean(),
      Output.find({ fecha: { $gte: rangeStart } }).populate('productId', 'precio categoria').lean(),
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

    // Movimientos por categoría (entradas vs salidas) - panel "Movimientos por Categoría"
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

    // Próximo reabastecimiento: productos con menor existencia primero
    const proximoReabastecimiento = [...products]
      .filter((p) => p.existencia <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.existencia - b.existencia)
      .slice(0, 6)
      .map((p) => ({
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria,
        existencia: p.existencia,
        precio: p.precio,
      }));

    // Nivel de stock general
    const stockMaximoReferencia = products.reduce((sum, p) => sum + Math.max(p.existencia, LOW_STOCK_THRESHOLD * 2), 0);
    const stockLevelPorcentaje =
      stockMaximoReferencia > 0 ? Number(((availableStock / stockMaximoReferencia) * 100).toFixed(1)) : 0;

    const nivelStockProductos = [...products]
      .sort((a, b) => a.existencia - b.existencia)
      .slice(0, 5)
      .map((p) => {
        const referencia = Math.max(p.existencia, LOW_STOCK_THRESHOLD * 2, 1);
        return {
          _id: p._id,
          nombre: p.nombre,
          existencia: p.existencia,
          referencia,
          porcentaje: Number(((p.existencia / referencia) * 100).toFixed(1)),
        };
      });

    return successResponse(res, 200, 'Estadísticas obtenidas correctamente', {
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
        estado: p.existencia === 0 ? 'Sin stock' : p.existencia <= LOW_STOCK_THRESHOLD ? 'Bajo stock' : 'Disponible',
      })),
    });
  } catch (error) {
    next(error);
  }
};

export default getStatistics;
