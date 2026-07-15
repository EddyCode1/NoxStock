import useAuthStore from '../../shared/stores/useAuthStore';
import WarehouseSelector from './WarehouseSelector';

const palette = {
  background: '#1E2022',
  surface: '#2B2D30',
  border: '#3F4245',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#8B1E1E',
};

const NavbarBlack = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const displayName = user?.nombre || user?.name || 'Usuario';

  return (
    <header
      className="px-6 py-6"
      style={{ background: palette.background, borderBottom: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em]" style={{ color: palette.textSecondary }}>
            Hola {displayName}
          </p>
          <h1
            className="text-2xl font-semibold leading-tight tracking-[0.02em]"
            style={{ color: palette.textPrimary }}
          >
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
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border text-lg transition hover:opacity-90"
            style={{
              borderColor: palette.border,
              background: palette.surface,
              color: palette.textPrimary,
            }}
          >
            {isSidebarOpen ? '⟨' : '⟩'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavbarBlack;
