import React from 'react'

const palette = {
  background: '#111827',
  tabActive: '#0f1c3f',
  tabInactive: '#1e3a6d',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  border: '#1e3a6d',
}

export default function ReportFilter({ active = 'summary', onChange = () => {} }) {
  const tabs = [
    { key: 'summary', label: 'Resumen' },
    { key: 'categories', label: 'Categorías' },
    { key: 'top', label: 'Top ventas' },
  ]

  return (
    <div style={{ background: palette.background, border: `1px solid ${palette.border}` }} className="inline-flex rounded-3xl p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              background: isActive ? palette.tabActive : 'transparent',
              color: isActive ? '#F5F6F8' : palette.textSecondary,
            }}
            className="px-4 py-2 rounded-3xl text-sm font-semibold transition"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
