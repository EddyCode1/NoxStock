import { useEffect, useMemo, useState } from 'react'
import noxReportsService from '../../../shared/api/services/noxReportsService'
import useWarehouseStore from '../../../shared/stores/useWarehouseStore'
import ReportFilter from '../components/ReportFilter'
import ReportTable from '../components/ReportTable'
import ExportButton from '../components/ExportButton'

const palette = {
  background: '#1E2022',
  container: '#2B2D30',
  border: '#3F4245',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#8B1E1E',
}

function mapCategoriesToRows(categories = []) {
  return categories.map((item) => ({
    period: item.category || item.name || 'Sin categoría',
    transactions: item.productCount ?? item.totalProducts ?? item.count ?? 0,
    total: item.estimatedValue ?? 0,
    closed: true,
    note: `${item.totalStock ?? 0} unidades en stock`,
    payments: 'Inventario',
    topTx: `${item.productCount ?? 0} productos`,
  }))
}

function mapTopProductsToRows(products = []) {
  return products.map((item) => ({
    period: item.productName || item.name || 'Producto',
    transactions: item.movements ?? 0,
    total: (item.soldUnits ?? 0) * (item.price ?? 0),
    closed: (item.currentStock ?? 0) > 0,
    note: item.category || 'Sin categoría',
    payments: `Stock: ${item.currentStock ?? 0}`,
    topTx: `${item.soldUnits ?? 0} vendidas`,
  }))
}

function downloadCsv(rows, filename) {
  const headers = ['Periodo', 'Movimientos', 'Total', 'Estado', 'Notas']
  const lines = rows.map((row) => [
    row.period,
    row.transactions,
    row.total,
    row.closed ? 'Cerrado' : 'Abierto',
    row.note || '',
  ])

  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [filter, setFilter] = useState('summary')
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exported, setExported] = useState(false)
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId)
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse())

  useEffect(() => {
    if (!selectedWarehouseId) {
      return
    }

    const loadReports = async () => {
      setLoading(true)
      setError(null)

      try {
        const [summaryRes, categoriesRes, topRes] = await Promise.all([
          noxReportsService.getSummary(),
          noxReportsService.getCategoriesReport(),
          noxReportsService.getTopProducts(),
        ])

        setSummary(summaryRes.data || summaryRes)
        setCategories(categoriesRes.data || [])
        setTopProducts(topRes.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar reportes')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [selectedWarehouseId])

  const tableData = useMemo(() => {
    if (filter === 'categories') {
      return mapCategoriesToRows(categories)
    }

    if (filter === 'top') {
      return mapTopProductsToRows(topProducts)
    }

    return mapTopProductsToRows(summary?.topProducts || topProducts)
  }, [filter, categories, topProducts, summary])

  const kpis = useMemo(() => {
    const inventory = summary?.inventory || {}
    const alerts = summary?.alerts || {}

    return {
      total: inventory.totalEstimatedValue ?? 0,
      avgTx: inventory.totalSoldUnits ?? 0,
      best: alerts.lowStockCount != null ? `${alerts.lowStockCount} bajo stock` : '-',
      products: inventory.totalProducts ?? 0,
      categories: inventory.totalCategories ?? 0,
      sold: inventory.totalSoldUnits ?? 0,
    }
  }, [summary])

  function handleExport() {
    const filename =
      filter === 'categories'
        ? 'reporte-categorias.csv'
        : filter === 'top'
          ? 'reporte-top-ventas.csv'
          : 'reporte-resumen.csv'

    downloadCsv(tableData, filename)
    setExported(true)
    setTimeout(() => setExported(false), 2200)
  }

  return (
    <div style={{ background: palette.background, color: palette.textPrimary }} className="min-h-full rounded-2xl p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row">
          <div>
            <h1 style={{ color: palette.textPrimary }} className="text-3xl font-semibold">
              Reportes de inventario
            </h1>
            <p style={{ color: palette.textSecondary }} className="mt-2 max-w-2xl text-sm">
              Panel conectado a reports-service con resumen, categorías y productos más vendidos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReportFilter active={filter} onChange={setFilter} />
            <ExportButton onClick={handleExport} disabled={exported || loading || !tableData.length} />
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: palette.textSecondary }}>Cargando reportes...</p>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div
                style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }}
                className="rounded-3xl p-5 shadow-sm"
              >
                <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">
                  Valor estimado
                </div>
                <div className="mt-4 text-3xl font-semibold">${kpis.total.toLocaleString()}</div>
              </div>
              <div
                style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }}
                className="rounded-3xl p-5 shadow-sm"
              >
                <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">
                  Unidades vendidas
                </div>
                <div className="mt-4 text-3xl font-semibold">{kpis.sold}</div>
              </div>
              <div
                style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }}
                className="rounded-3xl p-5 shadow-sm"
              >
                <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">
                  Productos / Categorías
                </div>
                <div className="mt-4 text-3xl font-semibold">
                  {kpis.products} / {kpis.categories}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 style={{ color: palette.textPrimary }} className="text-xl font-semibold">
                    {filter === 'categories' ? 'Por categoría' : filter === 'top' ? 'Top ventas' : 'Resumen de ventas'}
                  </h2>
                  <p style={{ color: palette.textSecondary }} className="mt-1 text-sm">
                    Datos en vivo desde inventory-service vía reports-service.
                  </p>
                </div>
                <div style={{ color: palette.textSecondary }} className="text-sm">
                  Mostrando {tableData.length} registros
                </div>
              </div>

              <ReportTable data={tableData} />
            </section>
          </>
        )}

        {exported && (
          <div
            style={{ background: palette.accent, color: '#ffffff' }}
            className="fixed bottom-6 right-6 rounded-2xl px-5 py-3 shadow-xl"
          >
            Archivo exportado
          </div>
        )}
      </div>
    </div>
  )
}
