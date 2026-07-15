import { useEffect, useMemo, useState } from 'react'
import noxReportsService from '../../../shared/api/services/noxReportsService'
import { useWarehouse } from '../../../shared/hooks/useWarehouse'
import ReportFilter from '../components/ReportFilter'
import ReportTable from '../components/ReportTable'
import ExportButton from '../components/ExportButton'

const palette = {
  background: '#071424',
  container: '#152A4C',
  border: '#1F3A66',
  header: '#0D1F3A',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  accent: '#3B82F6',
  accentSoft: '#60A5FA',
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
  const { selectedWarehouseId, selectedWarehouse, version, isReady } = useWarehouse()

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
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
  }, [isReady, selectedWarehouseId, version])

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
      sold: inventory.totalSoldUnits ?? 0,
      lowStock: alerts.lowStockCount ?? 0,
      products: inventory.totalProducts ?? 0,
      categories: inventory.totalCategories ?? 0,
      best: alerts.lowStockCount != null ? `${alerts.lowStockCount} bajo stock` : '-',
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
    <div style={{ background: palette.background, color: palette.textPrimary }} className="min-h-full rounded-[2rem] p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-sky-300/80">Reportes</p>
            <h1 className="text-3xl font-semibold">Panel de inventario</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Datos de {selectedWarehouse?.nombre || 'la bodega activa'} — resumen de productos, categorías y ventas con estilo azul marino.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReportFilter active={filter} onChange={setFilter} />
            <ExportButton onClick={handleExport} disabled={exported || loading || !tableData.length} />
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-3xl border border-red-800/70 bg-[#2B1D25] px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Cargando reportes...</p>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-[1.75rem] border border-slate-700 bg-[#0E1F3B] p-5 shadow-[0_20px_80px_-55px_rgba(0,0,0,0.7)]">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Valor estimado</div>
                <div className="mt-4 text-3xl font-semibold text-slate-100">${kpis.total.toLocaleString()}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700 bg-[#0E1F3B] p-5 shadow-[0_20px_80px_-55px_rgba(0,0,0,0.7)]">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Unidades vendidas</div>
                <div className="mt-4 text-3xl font-semibold text-slate-100">{kpis.sold}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700 bg-[#0E1F3B] p-5 shadow-[0_20px_80px_-55px_rgba(0,0,0,0.7)]">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Bajo stock</div>
                <div className="mt-4 text-3xl font-semibold text-slate-100">{kpis.lowStock}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700 bg-[#0E1F3B] p-5 shadow-[0_20px_80px_-55px_rgba(0,0,0,0.7)]">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Productos / Categorías</div>
                <div className="mt-4 text-3xl font-semibold text-slate-100">{kpis.products} / {kpis.categories}</div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-700 bg-[#112349] p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{filter === 'categories' ? 'Por categoría' : filter === 'top' ? 'Top ventas' : 'Resumen de ventas'}</h2>
                  <p className="mt-1 text-sm text-slate-400">Datos en vivo desde inventory-service vía reports-service.</p>
                </div>
                <div className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                  Mostrando {tableData.length} registros
                </div>
              </div>

              <ReportTable data={tableData} />
            </section>
          </>
        )}

        {exported && (
          <div className="fixed bottom-6 right-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm text-white shadow-xl">
            Archivo exportado
          </div>
        )}
      </div>
    </div>
  )
}
