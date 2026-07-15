import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedWarehouseId, selectedWarehouse, version, isReady } = useWarehouse();

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
      return;
    }

    const loadAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [lowStockRes, outOfStockRes] = await Promise.all([
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        setLowStock(lowStockRes?.data || []);
        setOutOfStock(outOfStockRes?.data || []);
      } catch (err) {
        console.error('Error al cargar alertas:', err);
        setError(err?.response?.data?.message || err?.message || 'Error al cargar alertas');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [isReady, selectedWarehouseId, version]);

  return (
    <section className="space-y-6 rounded-lg bg-gray-50 p-6">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Alertas de Inventario</h1>
        <p className="mt-1 text-sm text-gray-600">
          Productos con bajo stock y agotados en {selectedWarehouse?.nombre || 'la bodega activa'}
        </p>
      </header>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
          Cargando alertas...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              Bajo Inventario
              <span className="ml-auto rounded bg-white px-2 py-1 text-sm font-bold text-yellow-600">
                {lowStock.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {lowStock.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No hay productos con bajo stock</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item) => (
                  <li
                    key={item.id || item.name}
                    className="rounded-lg border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          Stock actual: <span className="font-bold text-yellow-700">{item.stock}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Alerta en:{' '}
                          <span className="font-bold text-yellow-700">
                            {item.minStock ?? '(global)'}
                          </span>
                        </div>
                        {item.category && (
                          <div className="mt-1 text-xs text-gray-500">{item.category}</div>
                        )}
                      </div>
                      <div className="text-2xl">ÔÜá´©Å</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              Agotados
              <span className="ml-auto rounded bg-white px-2 py-1 text-sm font-bold text-red-600">
                {outOfStock.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {outOfStock.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No hay productos agotados</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {outOfStock.map((item) => (
                  <li
                    key={item.id || item.name}
                    className="rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 p-3 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          Stock: <span className="font-bold text-red-700">{item.stock}</span>
                        </div>
                        {item.category && (
                          <div className="mt-1 text-xs text-gray-500">{item.category}</div>
                        )}
                      </div>
                      <div className="text-2xl">­ƒÜ½</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="text-sm text-blue-900">
              <span className="font-semibold">Total de alertas:</span> {lowStock.length + outOfStock.length}
            </div>
          </div>
          <div className="rounded-lg border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="text-sm text-gray-900">
              <span className="font-semibold">Bodega activa:</span> {selectedWarehouse?.nombre || 'ÔÇö'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
