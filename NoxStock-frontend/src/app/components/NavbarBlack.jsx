import useAuthStore from '../../shared/stores/useAuthStore'
import WarehouseSelector from './WarehouseSelector'

const palette = {
  background: '#1E2022',
  surface: '#2B2D30',
  border: '#3F4245',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#8B1E1E',
}

/**
 * Componente NavbarBlack - Cabecera minimalista del lobby
 */
const NavbarBlack = ({ isSidebarOpen = true, onToggleSidebar }) => {
    const user = useAuthStore((state) => state.user)
    const displayName = user?.nombre || user?.name || 'Usuario'

    return (
        <header
            className="py-6 px-6"
            style={{ background: palette.background, borderBottom: `1px solid ${palette.border}` }}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p style={{ color: palette.textSecondary }} className="text-sm uppercase tracking-[0.3em]">
                        Hola {displayName}
                    </p>
                    <h1 style={{ color: palette.textPrimary }} className="text-2xl font-semibold leading-tight tracking-[0.02em]">
                        Bienvenido al lobby
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex">
                        <WarehouseSelector />
                    </div>

                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
                        title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
                        style={{
                            borderColor: palette.border,
                            background: palette.surface,
                            color: palette.textPrimary,
                        }}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border text-lg transition hover:bg-[#3C3F45]"
                    >
                        {isSidebarOpen ? '⟨' : '⟩'}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default NavbarBlack
