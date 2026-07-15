import React from 'react'

const palette = {
  background: '#0f1c3f',
  backgroundDisabled: '#1e3a6d',
  text: '#F5F6F8',
}

export default function ExportButton({ onClick = () => {}, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? palette.backgroundDisabled : palette.background,
        color: palette.text,
      }}
      className="inline-flex items-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold shadow-sm transition-shadow disabled:opacity-70"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="3" y="3" width="14" height="18" rx="2" ry="2" />
        <path d="M7 11h4" />
        <path d="M7 15h4" />
      </svg>
      Exportar CSV
    </button>
  )
}
