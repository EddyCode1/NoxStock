import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';
import { sortWarehousesForDisplay } from '../utils/warehouseMapUtils';

const WarehousesMap = lazy(() => import('../components/WarehousesMap'));

function MapLoader() {
  return (
    <div className="flex h-[480px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-500">
      Cargando mapa…
    </div>
  );
}

export default function WarehouseMapPage() {
  const navigate = useNavigate();
  const {
    warehouses,
    selectedWarehouseId,
    selectedWarehouse,
    isCentral,
    setSelectedWarehouseId,
  } = useWarehouse();
  const setWarehouses = useWarehouseStore((state) => state.setWarehouses);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusWarehouseId, setFocusWarehouseId] = useState(null);
  const [switchMessage, setSwitchMessage] = useState('');

  const refreshWarehouses = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await inventoryService.getWarehouses();
      const list = data.warehouses || [];
      setWarehouses(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar bodegas');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setWarehouses]);

  useEffect(() => {
    if (warehouses.length === 0) {
      refreshWarehouses();
    }
  }, [warehouses.length, refreshWarehouses]);

  const handleSelectWarehouse = (warehouseId) => {
    const warehouse = warehouses.find((item) => item._id === warehouseId);

    if (!warehouse) {
      return;
    }

    setSelectedWarehouseId(warehouseId);
    setFocusWarehouseId(warehouseId);
    setSwitchMessage(
      warehouse.esCentral
        ? 'Vista consolidada activada: Central (todas las sucursales)'
        : `Sucursal activa: ${warehouse.nombre}`
    );
  };

  const ubicadas = warehouses.filter(
    (warehouse) => Number.isFinite(Number(warehouse.lat)) && Number.isFinite(Number(warehouse.lng))
  );
  const sortedWarehouses = sortWarehousesForDisplay(warehouses);

  return (
    <section className="space-y-6 rounded-lg bg-gray-50 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-blue-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Mapa de sucursales</h1>
          <p className="mt-1 text-sm text-gray-600">
            {ubicadas.length} ubicación(es) en el mapa · selecciona una para cambiar el contexto del sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshWarehouses}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Actualizar
          </button>
          <Link
            to="/loby/inventory/warehouses"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Gestionar bodegas
          </Link>
        </div>
      </header>

      {selectedWarehouse && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-semibold">Bodega activa:</span>{' '}
          {isCentral ? `★ ${selectedWarehouse.nombre} (consolidada)` : selectedWarehouse.nombre}
          {selectedWarehouse.direccion ? ` — ${selectedWarehouse.direccion}` : ''}
        </div>
      )}

      {switchMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {switchMessage}
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando bodegas...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Suspense fallback={<MapLoader />}>
          <WarehousesMap
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            focusWarehouseId={focusWarehouseId}
            onSelectWarehouse={handleSelectWarehouse}
          />
        </Suspense>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
              Sucursales
            </h2>
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {sortedWarehouses.map((warehouse) => {
                const isActive = warehouse._id === selectedWarehouseId;
                const hasLocation =
                  Number.isFinite(Number(warehouse.lat)) && Number.isFinite(Number(warehouse.lng));

                return (
                  <li
                    key={warehouse._id}
                    className={`rounded-lg border p-3 transition ${
                      isActive
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">
                          {warehouse.esCentral ? `★ ${warehouse.nombre}` : warehouse.nombre}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {warehouse.esCentral
                            ? 'Todas las sucursales'
                            : warehouse.direccion || 'Sin dirección'}
                        </p>
                        {!hasLocation && (
                          <p className="mt-1 text-xs text-amber-700">Sin coordenadas en mapa</p>
                        )}
                      </div>
                      {isActive && (
                        <span className="shrink-0 rounded bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Activa
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectWarehouse(warehouse._id)}
                        disabled={isActive}
                        className="rounded bg-blue-900 px-2 py-1 text-xs font-semibold text-white disabled:cursor-default disabled:bg-green-700"
                      >
                        {isActive ? 'Seleccionada' : 'Seleccionar'}
                      </button>
                      {hasLocation && (
                        <button
                          type="button"
                          onClick={() => setFocusWarehouseId(warehouse._id)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-white"
                        >
                          Ver en mapa
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">
              Acciones rápidas
            </h2>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/loby')}
                className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Ir al dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/loby/inventory')}
                className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Ver inventario de la sucursal activa
              </button>
              <button
                type="button"
                onClick={() => navigate('/loby/alerts')}
                className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Ver alertas de la sucursal activa
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
