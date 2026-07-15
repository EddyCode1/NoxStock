import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [lowStockRes, outOfStockRes] = await Promise.all([
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        // Extrae el arreglo de datos correctamente
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
  }, []);

  return (
    <section className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Alertas de Inventario</h1>
        <p className="text-sm text-gray-600 mt-1">Productos con bajo stock y agotados</p>
      </header>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          Cargando alertas...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bajo Inventario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Bajo Inventario
              <span className="ml-auto bg-white text-yellow-600 font-bold px-2 py-1 rounded text-sm">
                {lowStock.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {lowStock.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay productos con bajo stock</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item) => (
                  <li 
                    key={item.id || item.name} 
                    className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3 border-l-4 border-yellow-500 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Stock actual: <span className="font-bold text-yellow-700">{item.stock}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Alerta en: <span className="font-bold text-yellow-700">{item.lowStockThreshold ?? '(global)'}</span>
                        </div>
                        {item.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.category}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl">Alerta</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Agotados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Agotados
              <span className="ml-auto bg-white text-red-600 font-bold px-2 py-1 rounded text-sm">
                {outOfStock.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {outOfStock.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay productos agotados</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {outOfStock.map((item) => (
                  <li 
                    key={item.id || item.name} 
                    className="rounded-lg bg-gradient-to-r from-red-50 to-pink-50 p-3 border-l-4 border-red-500 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Stock: <span className="font-bold text-red-700">{item.stock}</span>
                        </div>
                        {item.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.category}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl">Agotado</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Resumen */}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-300">
            <div className="text-sm text-blue-900">
              <span className="font-semibold">Total de alertas:</span> {lowStock.length + outOfStock.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-300">
            <div className="text-sm text-gray-900">
              <span className="font-semibold">Última actualización:</span> Hace unos momentos
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
