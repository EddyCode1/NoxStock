import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';

export default function InventoryInsightsPage() {
  const [days, setDays] = useState(30);
  const [rotation, setRotation] = useState([]);
  const [noMovement, setNoMovement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());

  const loadReports = async (period = days) => {
    if (!selectedWarehouseId) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [rotationData, noMovementData] = await Promise.all([
        noxReportsService.getRotationReport({ days: period }),
        noxReportsService.getNoMovementReport({ days: period }),
      ]);
      setRotation(rotationData.data || []);
      setNoMovement(noMovementData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar análisis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(days);
  }, [selectedWarehouseId]);

  const handleApply = (event) => {
    event.preventDefault();
    loadReports(Number(days));
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Análisis de inventario</h1>
        <p className="text-sm text-gray-500">
          Rotación y sin movimiento en {selectedWarehouse?.nombre || 'la bodega activa'}
        </p>
      </header>

      <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3 rounded border p-4">
        <label className="text-sm">
          Días a analizar
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-1 block rounded border px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Actualizar
        </button>
      </form>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-3 font-semibold">Rotación ({rotation.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left">Producto</th>
                  <th className="px-2 py-1 text-right">Entradas</th>
                  <th className="px-2 py-1 text-right">Salidas</th>
                  <th className="px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rotation.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="px-2 py-1">{item.productName}</td>
                    <td className="px-2 py-1 text-right">{item.entriesQty}</td>
                    <td className="px-2 py-1 text-right">{item.outputsQty}</td>
                    <td className="px-2 py-1 text-right font-medium">{item.totalMovement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-3 font-semibold">Sin movimiento ({noMovement.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left">Producto</th>
                  <th className="px-2 py-1 text-right">Stock</th>
                  <th className="px-2 py-1 text-right">Días sin salida</th>
                </tr>
              </thead>
              <tbody>
                {noMovement.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="px-2 py-1">{item.productName}</td>
                    <td className="px-2 py-1 text-right">{item.currentStock}</td>
                    <td className="px-2 py-1 text-right">
                      {item.daysSinceLastOutput ?? 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
