import React from 'react'

const palette = {
  background: '#0D244F',
  tabActive: '#3B82F6',
  tabInactive: 'transparent',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  border: '#1F3A66',
}

export default function ReportFilter({ active = 'summary', onChange = () => {} }) {
  const tabs = [
    { key: 'summary', label: 'Resumen' },
    { key: 'categories', label: 'Categorías' },
    { key: 'top', label: 'Top ventas' },
  ]

  return (
    <div style={{ background: palette.background, border: `1px solid ${palette.border}` }} className="inline-flex rounded-[2rem] p-1 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.65)]">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              background: isActive ? palette.tabActive : palette.tabInactive,
              color: isActive ? '#FFFFFF' : palette.textSecondary,
            }}
            className="px-4 py-2 rounded-[1.5rem] text-sm font-semibold transition"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
