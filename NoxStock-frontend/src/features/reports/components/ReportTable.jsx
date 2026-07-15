import React, { useState } from 'react'

const palette = {
  background: '#111827',
  border: '#1e3a6d',
  headerBackground: '#0b0e14',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#3b5bab',
}

export default function ReportTable({ data = [] }) {
  const [expanded, setExpanded] = useState(null)

  if (!data.length) {
    return (
      <div
        style={{ background: palette.background, border: `1px solid ${palette.border}`, color: palette.textSecondary }}
        className="rounded-3xl px-4 py-8 text-center text-sm"
      >
        No hay datos para mostrar en este filtro.
      </div>
    )
  }

  return (
    <div
      style={{ background: palette.background, border: `1px solid ${palette.border}` }}
      className="overflow-x-auto rounded-3xl shadow-sm"
    >
      <table className="min-w-full">
        <thead style={{ background: palette.headerBackground, borderBottom: `1px solid ${palette.border}` }}>
          <tr>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em]">Nombre / Categoría</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em]">Movimientos</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em]">Total</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em]">Estado</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em]">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <React.Fragment key={`${row.period}-${idx}`}>
              <tr style={{ borderBottom: `1px solid ${palette.border}` }} className="hover:bg-[#0f1c3f]/20">
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-sm">{row.period}</td>
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-right text-sm">{row.transactions}</td>
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold">${Number(row.total || 0).toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4 text-center text-sm">
                  <span
                    style={{
                      color: row.closed ? '#DEF7EF' : '#FEE2E2',
                      background: row.closed ? '#064E3B' : '#7F1D1D',
                    }}
                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  >
                    {row.closed ? 'OK' : 'Bajo'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-center text-sm">
                  <button
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    style={{ color: palette.accent }}
                    className="font-semibold"
                    type="button"
                  >
                    Ver
                  </button>
                </td>
              </tr>
              {expanded === idx && (
                <tr style={{ background: '#0f1424' }}>
                  <td colSpan="5" className="px-4 py-4 text-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Notas</div>
                        <div style={{ color: palette.textPrimary }} className="mt-1 text-sm">{row.note || 'Sin notas adicionales.'}</div>
                      </div>
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Stock / método</div>
                        <div style={{ color: palette.textPrimary }} className="mt-1 text-sm">{row.payments || '-'}</div>
                      </div>
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Destacado</div>
                        <div style={{ color: palette.textPrimary }} className="mt-1 text-sm">{row.topTx || '-'}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
