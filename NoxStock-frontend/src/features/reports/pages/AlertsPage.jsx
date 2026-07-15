import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [error, setError] = useState(null);
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());

  useEffect(() => {
    if (!selectedWarehouseId) {
      return;
    }

    const loadAlerts = async () => {
      try {
        const [lowStockData, outOfStockData] = await Promise.all([
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        setLowStock(lowStockData.data || []);
        setOutOfStock(outOfStockData.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar alertas');
      }
    };

    loadAlerts();
  }, [selectedWarehouseId]);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Alertas de inventario</h1>
        <p className="text-sm text-gray-500">
          Bajo stock y agotados en {selectedWarehouse?.nombre || 'la bodega activa'}
        </p>
      </header>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Bajo inventario</h2>
          <ul className="space-y-1 text-sm">
            {lowStock.map((item) => (
              <li key={item.id || item.name}>
                {item.name} - stock: {item.stock}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Agotados</h2>
          <ul className="space-y-1 text-sm">
            {outOfStock.map((item) => (
              <li key={item.id || item.name}>
                {item.name} - stock: {item.stock}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
