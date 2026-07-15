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
import { PageLoading, PageButton, StatusBadge } from '../../../shared/components/ui';
import NoxLogo from '../../../shared/components/NoxLogo';

/**
 * Página principal del Dashboard de estadísticas (Zeta).
 * Misma distribución visual; datos filtrados por sucursal seleccionada.
 */
export default function EstadisticasDashboardPage() {
  const { data, loading, error, reload, selectedWarehouse, isCentral, warehouseId } = useEstadisticas();

  const warehouseLabel = data?.warehouse?.nombre || selectedWarehouse?.nombre || 'Sucursal';
  const vistaConsolidada = data?.vistaConsolidada ?? isCentral;

  if (loading && !data) {
    return (
      <section className="nox-page-shell flex h-[60vh] items-center justify-center">
        <PageLoading message={`Cargando estadísticas de ${warehouseLabel}`} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="nox-page-shell flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="nox-reveal-child text-lg font-semibold" style={{ color: palette.textPrimary }}>
          No se pudieron cargar las estadísticas
        </p>
        <p className="nox-reveal-child max-w-md text-sm" style={{ color: palette.textSecondary }}>
          {error}
        </p>
        <div className="nox-reveal-child">
          <PageButton type="button" onClick={reload}>
            Reintentar
          </PageButton>
        </div>
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

  const scopeHint = vistaConsolidada
    ? 'Vista consolidada de todas las sucursales operativas'
    : `Datos exclusivos de ${warehouseLabel}`;

  return (
    <section key={warehouseId} className="nox-page-shell nox-stagger-children space-y-6 pb-4">
      <header className="nox-reveal-child flex flex-col gap-2 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <NoxLogo size="sm" />
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.textSecondary }}>
            Panel Principal
          </p>
          <StatusBadge tone={vistaConsolidada ? 'navy' : 'neutral'}>
            {vistaConsolidada ? 'Central · Consolidado' : warehouseLabel}
          </StatusBadge>
        </div>
        <h1 className="nox-title-shimmer text-2xl font-semibold tracking-[0.01em]">
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: palette.textSecondary }}>
          {scopeHint}. Resumen de inventario, movimientos y niveles de stock.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          key={`products-${warehouseId}`}
          label="Total de Productos"
          value={resumen.totalProductos ?? 0}
          changeLabel={vistaConsolidada ? 'Catálogo consolidado' : 'Inventario activo'}
          tone="neutral"
        />
        <MetricCard
          key={`stock-${warehouseId}`}
          label="Stock Disponible"
          value={resumen.stockDisponible ?? 0}
          changeLabel={vistaConsolidada ? 'Suma de sucursales' : 'Unidades en almacén'}
          tone="positive"
        />
        <MetricCard
          key={`low-${warehouseId}`}
          label="Bajo Stock"
          value={resumen.bajoStock ?? 0}
          changeLabel="Requiere atención"
          tone="negative"
        />
        <MetricCard
          key={`out-${warehouseId}`}
          label="Sin Stock"
          value={resumen.sinStock ?? 0}
          changeLabel="Agotados"
          tone="negative"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <ChartCard
          title="Ganancia por Categoría"
          subtitle={vistaConsolidada ? 'Valor estimado consolidado' : `Valor estimado · ${warehouseLabel}`}
        >
          <DonutChart
            categorias={gananciaPorCategoria.categorias}
            totalLabel={vistaConsolidada ? 'Valor Total Consolidado' : 'Valor Total en Sucursal'}
            totalValue={`Q${Number(gananciaPorCategoria.totalValorEstimado).toLocaleString('es-GT', {
              maximumFractionDigits: 0,
            })}`}
          />
        </ChartCard>

        <ChartCard
          title="Resumen de Órdenes"
          subtitle={
            vistaConsolidada
              ? 'Movimiento consolidado · últimos 7 días'
              : `Movimiento en ${warehouseLabel} · últimos 7 días`
          }
          headerRight={
            <span className="text-right">
              <p className="text-xs" style={{ color: palette.textSecondary }}>Movimiento Total</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: palette.textPrimary }}>
                Q{Number(resumenOrdenes.totalSemana).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
              </p>
            </span>
          }
        >
          <OrderSummaryLineChart serie={resumenOrdenes.serie} />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="nox-reveal-child xl:col-span-1">
          <StockLevel
            porcentaje={nivelStock.porcentaje}
            totalStock={nivelStock.totalStock}
            productos={nivelStock.productos}
          />
        </div>
        <div className="nox-reveal-child xl:col-span-1">
          <UpcomingRestock productos={proximoReabastecimiento} />
        </div>
        <div className="nox-reveal-child xl:col-span-1">
          <MovimientosPorCategoria categorias={movimientosPorCategoria} />
        </div>
      </div>

      <div className="nox-reveal-child">
        <ProductsTable productos={productos} />
      </div>
    </section>
  );
}
