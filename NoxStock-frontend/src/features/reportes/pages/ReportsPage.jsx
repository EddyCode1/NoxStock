import React, { useMemo, useState } from 'react'
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

const MOCK = {
  day: [
    { period: '2026-07-15', transactions: 124, total: 15230.5, closed: true, note: 'Promoción A', payments: 'Efectivo, Tarjeta', topTx: 'ORD-123' },
    { period: '2026-07-14', transactions: 98, total: 11020.0, closed: true, note: '', payments: 'Tarjeta', topTx: 'ORD-118' },
  ],
  week: [
    { period: 'Sem 28 (4-10 Jul)', transactions: 812, total: 98020.0, closed: true, payments: 'Mixto' },
    { period: 'Sem 27 (27 Jun-3 Jul)', transactions: 742, total: 88920.5, closed: true, payments: 'Mixto' },
  ],
  month: [
    { period: 'Junio 2026', transactions: 3200, total: 412300.25, closed: true, payments: 'Mixto' },
    { period: 'Mayo 2026', transactions: 2980, total: 389120.7, closed: true, payments: 'Mixto' },
  ],
}

export default function ReportsPage() {
  const [filter, setFilter] = useState('day')
  const [exported, setExported] = useState(false)

  const data = useMemo(() => MOCK[filter] || [], [filter])

  const kpis = useMemo(() => {
    const total = data.reduce((s, r) => s + r.total, 0)
    const avgTx = data.length ? Math.round(data.reduce((s, r) => s + r.transactions, 0) / data.length) : 0
    const best = data.reduce((b, r) => (!b || r.total > b.total ? r : b), null)
    return { total, avgTx, best: best ? best.period : '-' }
  }, [data])

  function handleExport() {
    setExported(true)
    setTimeout(() => setExported(false), 2200)
  }

  return (
    <div style={{ background: palette.background, color: palette.textPrimary }} className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: palette.textPrimary }} className="text-3xl font-semibold">Reportes de Ventas</h1>
            <p style={{ color: palette.textSecondary }} className="mt-2 text-sm max-w-2xl">Un panel de control limpio y moderno para visualizar el rendimiento comercial del período seleccionado.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReportFilter active={filter} onChange={setFilter} />
            <ExportButton onClick={handleExport} disabled={exported} />
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-5 rounded-3xl shadow-sm">
            <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">Total de Ventas ({filter})</div>
            <div className="mt-4 text-3xl font-semibold">${kpis.total.toLocaleString()}</div>
          </div>
          <div style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-5 rounded-3xl shadow-sm">
            <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">Promedio de Transacciones</div>
            <div className="mt-4 text-3xl font-semibold">{kpis.avgTx} tx</div>
          </div>
          <div style={{ background: palette.container, border: `1px solid ${palette.border}`, color: palette.textPrimary }} className="p-5 rounded-3xl shadow-sm">
            <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.24em]">Mejor Período</div>
            <div className="mt-4 text-3xl font-semibold">{kpis.best}</div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h2 style={{ color: palette.textPrimary }} className="text-xl font-semibold">Desglose de Ventas</h2>
              <p style={{ color: palette.textSecondary }} className="mt-1 text-sm">Datos estáticos con UI de reporte según filtro seleccionado.</p>
            </div>
            <div style={{ color: palette.textSecondary }} className="text-sm">Mostrando {data.length} registros</div>
          </div>

          <ReportTable data={data} />
        </section>

        {exported && (
          <div style={{ background: palette.accent, color: '#ffffff' }} className="fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-xl">
            Exportando archivo... ✅
          </div>
        )}
      </div>
    </div>
  )
}
