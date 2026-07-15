import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../shared/stores/useAuthStore';

const links = [
  { to: '/loby', label: 'Dashboard' },
  { to: '/loby/inventory', label: 'Productos' },
  { to: '/loby/inventory/movements', label: 'Movimientos' },
  { to: '/loby/reports', label: 'Reportes' },
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
      className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-white transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">NoxStock</h1>
        <p className="text-sm text-gray-500">Gestión de inventario</p>
        {user?.nombre && <p className="mt-2 text-xs text-gray-600">{user.nombre}</p>}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="m-4 rounded border px-3 py-2 text-sm"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
