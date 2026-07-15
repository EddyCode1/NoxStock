import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

const statCards = [
  {
    key: 'products',
    label: 'Productos',
    color: 'from-blue-900 to-blue-700',
    text: 'text-white',
    link: '/loby/inventory',
    linkLabel: 'Ver inventario',
  },
  {
    key: 'lowStock',
    label: 'Bajo stock',
    color: 'from-yellow-500 to-yellow-600',
    text: 'text-white',
    link: '/loby/alerts',
    linkLabel: 'Ver alertas',
  },
  {
    key: 'outOfStock',
    label: 'Agotados',
    color: 'from-red-600 to-red-700',
    text: 'text-white',
    link: '/loby/alerts',
    linkLabel: 'Ver alertas',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedWarehouseId, selectedWarehouse, version, isReady, isCentral } = useWarehouse();

  useEffect(() => {
    setStats({ products: 0, lowStock: 0, outOfStock: 0 });
    setLoading(true);
  }, [selectedWarehouseId, version]);

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
      return;
    }

    const loadStats = async () => {
      try {
        const [productsData, lowStockData, outOfStockData] = await Promise.all([
          inventoryService.getProducts(),
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        setStats({
          products: productsData.total || productsData.products?.length || 0,
          lowStock: lowStockData.count || lowStockData.data?.length || 0,
          outOfStock: outOfStockData.count || outOfStockData.data?.length || 0,
        });
      } catch (error) {
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isReady, selectedWarehouseId, version]);

  return (
    <section className="space-y-6 rounded-lg bg-gray-50 p-6">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Dashboard NoxStock</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isCentral
            ? 'Resumen consolidado de todas las sucursales'
            : `Resumen de ${selectedWarehouse?.nombre || 'la bodega seleccionada'}`}
        </p>
        {selectedWarehouse?.direccion && (
          <p className="mt-1 text-xs text-gray-500">{selectedWarehouse.direccion}</p>
        )}
      </header>

      {isCentral && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Estás en la vista <strong>Central</strong>: los totales incluyen todas las sucursales. Para
          registrar movimientos o ventas, cambia a una sucursal operativa desde el mapa o el selector
          superior.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br ${card.color} shadow-sm`}
          >
            <div className={`p-5 ${card.text}`}>
              <p className="text-sm font-medium opacity-90">{card.label}</p>
              <p className="mt-2 text-4xl font-bold">
                {loading ? '…' : stats[card.key]}
              </p>
              <Link
                to={card.link}
                className="mt-4 inline-block text-xs font-semibold underline opacity-90 hover:opacity-100"
              >
                {card.linkLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
            Operaciones
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/loby/inventory/movements" className="rounded bg-blue-900 px-4 py-2 text-sm text-white hover:bg-blue-800">
              Movimientos
            </Link>
            <Link to="/loby/inventory/sales" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Ventas
            </Link>
            <Link to="/loby/inventory/purchase-orders" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Órdenes de compra
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
            Análisis y ubicación
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/loby/reports" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
              Reportes
            </Link>
            <Link to="/loby/reports/insights" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Análisis inventario
            </Link>
            <Link to="/loby/inventory/warehouses/map" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Mapa de sucursales
            </Link>
            <Link to="/loby/alerts" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Alertas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
