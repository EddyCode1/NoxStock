import React, { useState } from 'react'

const palette = {
  background: '#2B2D30',
  border: '#3F4245',
  rowHover: '#25282C',
  headerBackground: '#232528',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#8B1E1E',
}

/**
 * ReportTable (ES)
 * Muestra un listado responsivo de ventas con detalle expandible.
 * Props:
 * - data: Array<{ period, transactions, total, closed, note, payments, topTx }>
 */
export default function ReportTable({ data = [] }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div
      style={{ background: palette.background, border: `1px solid ${palette.border}` }}
      className="overflow-x-auto rounded-3xl shadow-sm"
    >
      <table className="min-w-full">
        <thead style={{ background: palette.headerBackground, borderBottom: `1px solid ${palette.border}` }}>
          <tr>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em]">Fecha / Período</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em]">Cantidad de Transacciones</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em]">Total Facturado</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em]">Estado de Cierre</th>
            <th style={{ color: palette.textSecondary }} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <React.Fragment key={`${row.period}-${idx}`}>
              <tr style={{ borderBottom: `1px solid ${palette.border}` }} className="hover:bg-[#232528]">
                <td style={{ color: palette.textPrimary }} className="px-4 py-4 whitespace-nowrap text-sm">{row.period}</td>
                <td style={{ color: palette.textPrimary }} className="px-4 py-4 whitespace-nowrap text-right text-sm">{row.transactions}</td>
                <td style={{ color: palette.textPrimary }} className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">${row.total.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                  <span
                    style={{
                      color: row.closed ? '#DEF7EF' : '#FEE2E2',
                      background: row.closed ? '#064E3B' : '#7F1D1D',
                    }}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {row.closed ? 'Cerrado' : 'Abierto'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    style={{ color: palette.accent }}
                    className="font-semibold"
                  >
                    Ver
                  </button>
                </td>
              </tr>
              {expanded === idx && (
                <tr style={{ background: '#242629' }}>
                  <td colSpan="5" className="px-4 py-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Notas</div>
                        <div style={{ color: palette.textPrimary }} className="mt-1 text-sm">{row.note || 'Sin notas adicionales.'}</div>
                      </div>
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Métodos de pago</div>
                        <div style={{ color: palette.textPrimary }} className="mt-1 text-sm">{row.payments || 'Efectivo, Tarjeta'}</div>
                      </div>
                      <div>
                        <div style={{ color: palette.textSecondary }} className="text-xs uppercase tracking-[0.12em]">Transacciones destacadas</div>
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
