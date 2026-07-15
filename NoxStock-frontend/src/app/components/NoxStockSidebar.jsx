import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../shared/stores/useAuthStore';

const links = [
  { to: '/loby', label: 'Dashboard' },
  { to: '/loby/inventory', label: 'Productos' },
  { to: '/loby/inventory/movements', label: 'Movimientos' },
  { to: '/loby/inventory/suppliers', label: 'Proveedores' },
  { to: '/loby/inventory/purchase-orders', label: 'Órdenes de compra' },
  { to: '/loby/inventory/customers', label: 'Clientes' },
  { to: '/loby/inventory/sales', label: 'Ventas' },
  { to: '/loby/inventory/warehouses', label: 'Bodegas' },
  { to: '/loby/inventory/warehouses/map', label: 'Mapa bodegas' },
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
      className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#1e3a6d] bg-[#0b0e14] text-gray-200 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="border-b border-[#1e3a6d] p-4">
        <h1 className="text-xl font-bold text-white">NoxStock</h1>
        <p className="text-sm text-gray-400">Gestión de inventario</p>
        {user?.nombre && <p className="mt-2 text-xs text-gray-500">{user.nombre}</p>}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block rounded px-3 py-2 text-sm text-gray-200 hover:bg-[#0f1c3f] hover:text-white transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="m-4 rounded border border-[#4b5563] px-3 py-2 text-sm text-gray-200 hover:bg-[#0f1c3f] hover:text-white transition"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
