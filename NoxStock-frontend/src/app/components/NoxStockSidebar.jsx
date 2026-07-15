import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../shared/stores/useAuthStore';

const palette = {
  background: '#1E2022',
  surface: '#2B2D30',
  border: '#3F4245',
  textPrimary: '#F5F6F8',
  textSecondary: '#8A8F98',
  accent: '#8B1E1E',
};

const links = [
  { to: '/loby', label: 'Dashboard' },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ background: palette.background, borderColor: palette.border }}
    >
      <div className="p-4" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <h1 style={{ color: palette.textPrimary }} className="text-xl font-bold tracking-[0.03em]">NoxStock</h1>
        <p style={{ color: palette.textSecondary }} className="text-sm mt-1">Gestión clara y directa</p>
        {user?.nombre && (
          <p style={{ color: palette.textSecondary }} className="mt-3 text-xs uppercase tracking-[0.2em]">
            {user.nombre}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block rounded-3xl px-3 py-3 text-sm transition"
            style={{
              color: palette.textPrimary,
              background: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="m-4 rounded-3xl px-4 py-3 text-sm font-semibold transition"
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
