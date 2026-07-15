import { useNavigate, NavLink } from 'react-router-dom';
import useAuthStore from '../../shared/stores/useAuthStore';
import { palette } from '../../shared/theme/noxTheme';
import NoxLogo from '../../shared/components/NoxLogo';

const links = [
  { to: '/loby', label: 'Dashboard', end: true },
  { to: '/loby/inventory', label: 'Productos' },
  { to: '/loby/inventory/movements', label: 'Movimientos' },
  { to: '/loby/inventory/suppliers', label: 'Proveedores' },
  { to: '/loby/inventory/purchase-orders', label: 'Órdenes de compra' },
  { to: '/loby/inventory/customers', label: 'Clientes' },
  { to: '/loby/inventory/sales', label: 'Ventas' },
  { to: '/loby/inventory/warehouses', label: 'Bodegas' },
  { to: '/loby/inventory/warehouses/map', label: 'Mapa sucursales' },
  { to: '/loby/reports', label: 'Reportes' },
  { to: '/loby/reports/insights', label: 'Análisis inventario' },
  { to: '/loby/alerts', label: 'Alertas' },
];

export default function NoxStockSidebar({ isOpen = true }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const ripple = (event) => {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const rippleEl = document.createElement('span');
    rippleEl.className = 'nox-btn-ripple';
    rippleEl.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - rect.left - size / 2}px;top:${event.clientY - rect.top - size / 2}px;background:rgba(255,255,255,0.3)`;
    btn.appendChild(rippleEl);
    rippleEl.addEventListener('animationend', () => rippleEl.remove(), { once: true });
  };

  const handleLogout = (event) => {
    ripple(event);
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ background: palette.bgPage, borderColor: palette.border }}
    >
      <div className="p-4 nox-reveal-child" style={{ borderBottom: `1px solid ${palette.border}`, animationDelay: '0.05s' }}>
        <NoxLogo size="md" animated showText />
        <p className="mt-3 text-sm" style={{ color: palette.textSecondary }}>
          Gestión clara y directa
        </p>
        {user?.nombre && (
          <p className="mt-3 text-xs uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
            {user.nombre}
          </p>
        )}
      </div>

      <nav className="nox-stagger-children flex-1 space-y-1 overflow-y-auto p-4 nox-dark-scroll">
        {links.map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `nox-sidebar-link nox-reveal-child block rounded-2xl px-3 py-3 text-sm ${
                isActive ? 'nox-sidebar-link--active' : ''
              }`
            }
            style={{
              color: palette.textPrimary,
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              animationDelay: `${0.08 + index * 0.04}s`,
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="nox-btn-interactive m-4 rounded-2xl px-4 py-3 text-sm font-semibold"
        style={{
          background: palette.accent,
          color: '#ffffff',
          border: `1px solid ${palette.accent}`,
        }}
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
