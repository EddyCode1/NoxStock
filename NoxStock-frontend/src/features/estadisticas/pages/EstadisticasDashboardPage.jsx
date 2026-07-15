import useEstadisticas from '../hooks/useEstadisticas';
import { palette } from '../theme';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import DonutChart from '../components/DonutChart';
import OrderSummaryLineChart from '../components/OrderSummaryLineChart';
import MovimientosPorCategoria from '../components/MovimientosPorCategoria';
import StockLevel from '../components/StockLevel';
import UpcomingRestock from '../components/UpcomingRestock';
import ProductsTable from '../components/ProductsTable';
import Spinner from '../../../shared/components/Spinner';

/**
 * Página principal del Dashboard de estadísticas.
 * Consume GET /statistics (inventory-service) y replica la distribución
 * de la imagen de referencia usando la paleta azul marino / negro / gris.
 */
export default function EstadisticasDashboardPage() {
  const { data, loading, error, reload } = useEstadisticas();

  if (loading && !data) {
    return (
      <section className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold" style={{ color: palette.textPrimary }}>
          No se pudieron cargar las estadísticas
        </p>
        <p className="max-w-md text-sm" style={{ color: palette.textSecondary }}>
          {error}
        </p>
        <button
          type="button"
          onClick={reload}
          className="rounded-full px-5 py-2 text-sm font-semibold transition"
          style={{ background: palette.navy, color: '#fff' }}
        >
          Reintentar
        </button>
      </section>
    );
  }

  const resumen = data?.resumen || {};
  const gananciaPorCategoria = data?.gananciaPorCategoria || { totalValorEstimado: 0, categorias: [] };
  const resumenOrdenes = data?.resumenOrdenes || { totalSemana: 0, serie: [] };
  const movimientosPorCategoria = data?.movimientosPorCategoria || [];
  const nivelStock = data?.nivelStock || { porcentaje: 0, totalStock: 0, productos: [] };
  const proximoReabastecimiento = data?.proximoReabastecimiento || [];
  const productos = data?.productos || [];

  return (
    <section className="space-y-6 pb-4">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.textSecondary }}>
          Panel Principal
        </p>
        <h1 className="text-2xl font-semibold tracking-[0.01em]" style={{ color: palette.textPrimary }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: palette.textSecondary }}>
          Resumen general del inventario, movimientos y niveles de stock.
        </p>
      </header>

      {/* 4 tarjetas de métricas superiores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total de Productos" value={resumen.totalProductos ?? 0} changeLabel="Inventario activo" tone="neutral" />
        <MetricCard label="Stock Disponible" value={resumen.stockDisponible ?? 0} changeLabel="Unidades en almacén" tone="positive" />
        <MetricCard label="Bajo Stock" value={resumen.bajoStock ?? 0} changeLabel="Requiere atención" tone="negative" />
        <MetricCard label="Sin Stock" value={resumen.sinStock ?? 0} changeLabel="Agotados" tone="negative" />
      </div>

      {/* Ganancia por Categoría + Resumen de Órdenes */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <ChartCard title="Ganancia por Categoría" subtitle="Valor estimado del inventario">
          <DonutChart
            categorias={gananciaPorCategoria.categorias}
            totalLabel="Ganancia Anual Total"
            totalValue={`Q${Number(gananciaPorCategoria.totalValorEstimado).toLocaleString('es-GT', {
              maximumFractionDigits: 0,
            })}`}
          />
        </ChartCard>

        <ChartCard
          title="Resumen de Órdenes"
          subtitle="Movimiento de inventario - últimos 7 días"
          headerRight={
            <span className="text-right">
              <p className="text-xs" style={{ color: palette.textSecondary }}>Movimiento Total</p>
              <p className="text-lg font-bold" style={{ color: palette.textPrimary }}>
                Q{Number(resumenOrdenes.totalSemana).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
              </p>
            </span>
          }
        >
          <OrderSummaryLineChart serie={resumenOrdenes.serie} />
        </ChartCard>
      </div>

      {/* Nivel de Stock / Próximo Reabastecimiento + Movimientos por Categoría */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <StockLevel
            porcentaje={nivelStock.porcentaje}
            totalStock={nivelStock.totalStock}
            productos={nivelStock.productos}
          />
        </div>
        <div className="xl:col-span-1">
          <UpcomingRestock productos={proximoReabastecimiento} />
        </div>
        <div className="xl:col-span-1">
          <MovimientosPorCategoria categorias={movimientosPorCategoria} />
        </div>
      </div>

      {/* Tabla de productos */}
      <ProductsTable productos={productos} />
    </section>
  );
}
