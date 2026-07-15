import useAuthStore from '../../shared/stores/useAuthStore';
import WarehouseSelector from './WarehouseSelector';
import { palette } from '../../shared/theme/noxTheme';
import { useRipple } from '../../shared/hooks/useRipple';
import NoxLogo from '../../shared/components/NoxLogo';

const NavbarBlack = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const displayName = user?.nombre || user?.name || 'Usuario';
  const ripple = useRipple('rgba(63, 95, 196, 0.35)');

  const handleToggle = (event) => {
    ripple(event);
    onToggleSidebar?.();
  };

  return (
    <header
      className="nox-reveal-child px-6 py-6"
      style={{ background: palette.bgPage, borderBottom: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {!isSidebarOpen && <NoxLogo size="sm" animated />}
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
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <WarehouseSelector />
          </div>

          <button
            type="button"
            onClick={handleToggle}
            aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
            title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            className="nox-btn-interactive inline-flex h-12 w-12 items-center justify-center rounded-full border text-lg"
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
