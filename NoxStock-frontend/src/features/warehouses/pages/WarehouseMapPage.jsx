import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';

const WarehousesMap = lazy(() => import('../components/WarehousesMap'));

function MapLoader() {
  return <div className="flex h-[420px] items-center justify-center rounded border text-sm text-gray-500">Cargando mapa…</div>;
}

export default function WarehouseMapPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getWarehouses();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar bodegas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mapa de bodegas</h1>
          <p className="text-sm text-gray-500">{warehouses.length} ubicación(es) registrada(s)</p>
        </div>
        <Link to="/loby/inventory/warehouses" className="rounded border px-4 py-2 text-sm">
          Gestionar bodegas
        </Link>
      </header>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <Suspense fallback={<MapLoader />}>
        <WarehousesMap warehouses={warehouses} />
      </Suspense>
    </section>
  );
}
