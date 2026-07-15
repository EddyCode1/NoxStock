import React from 'react'

const palette = {
  background: '#2B2D30',
  tabActive: '#8B1E1E',
  tabInactive: '#3F4245',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  border: '#3F4245',
}

export default function ReportFilter({ active = 'day', onChange = () => {} }) {
  const tabs = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
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
