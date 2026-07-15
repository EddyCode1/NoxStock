import React, { useState } from 'react'

const palette = {
  background: '#0B1B37',
  border: '#1E325D',
  headerBackground: '#0E1F43',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  accent: '#3B82F6',
}

export default function ReportTable({ data = [] }) {
  const [expanded, setExpanded] = useState(null)

  if (!data.length) {
    return (
      <div
        style={{ background: palette.background, border: `1px solid ${palette.border}`, color: palette.textSecondary }}
        className="rounded-[2rem] px-4 py-8 text-center text-sm"
      >
        No hay datos para mostrar en este filtro.
      </div>
    )
  }

  return (
    <div
      style={{ background: palette.background, border: `1px solid ${palette.border}` }}
      className="overflow-x-auto rounded-[2rem] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)]"
    >
      <table className="min-w-full">
        <thead style={{ background: palette.headerBackground, borderBottom: `1px solid ${palette.border}` }}>
          <tr>
            <th style={{ color: palette.textSecondary }} className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em]">Nombre / Categoría</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em]">Movimientos</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em]">Total</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.15em]">Estado</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.15em]">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <React.Fragment key={`${row.period}-${idx}`}>
              <tr style={{ borderBottom: `1px solid ${palette.border}` }} className="hover:bg-[#122A50]">
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-sm">{row.period}</td>
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-right text-sm">{row.transactions}</td>
                <td style={{ color: palette.textPrimary }} className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold">${Number(row.total || 0).toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4 text-center text-sm">
                  <span
                    style={{
                      color: row.closed ? '#D6E4FF' : '#F8BBD0',
                      background: row.closed ? 'rgba(59,130,246,0.12)' : 'rgba(226,232,240,0.12)',
                      borderColor: row.closed ? 'rgba(59,130,246,0.26)' : 'rgba(226,232,240,0.28)',
                    }}
                    className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold"
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
                <tr style={{ background: '#0D244F' }}>
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
