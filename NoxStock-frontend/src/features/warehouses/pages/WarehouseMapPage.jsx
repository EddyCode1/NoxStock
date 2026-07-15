import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';
import { sortWarehousesForDisplay } from '../utils/warehouseMapUtils';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageButton,
  PageLinkButton,
  PageAlert,
  PageMessage,
  PageLoading,
  StatusBadge,
} from '../../../shared/components/ui';
import { palette } from '../../../shared/theme/noxTheme';

const WarehousesMap = lazy(() => import('../components/WarehousesMap'));

function MapLoader() {
  return (
    <div
      className="flex h-[480px] items-center justify-center rounded-2xl border text-sm"
      style={{ borderColor: palette.border, color: palette.textMuted, background: palette.surfaceAlt }}
    >
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
    if (!warehouse) return;

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
    <PageShell>
      <PageHeader
        title="Mapa de sucursales"
        subtitle={`${ubicadas.length} ubicación(es) en el mapa · selecciona una para cambiar el contexto del sistema`}
        actions={
          <>
            <PageButton variant="secondary" onClick={refreshWarehouses}>Actualizar</PageButton>
            <PageLinkButton to="/loby/inventory/warehouses" variant="secondary">Gestionar bodegas</PageLinkButton>
          </>
        }
      />

      {selectedWarehouse && (
        <PageAlert tone="info">
          <span className="font-semibold">Bodega activa:</span>{' '}
          {isCentral ? `★ ${selectedWarehouse.nombre} (consolidada)` : selectedWarehouse.nombre}
          {selectedWarehouse.direccion ? ` — ${selectedWarehouse.direccion}` : ''}
        </PageAlert>
      )}

      {switchMessage && <PageMessage tone="success">{switchMessage}</PageMessage>}
      {loading && <PageLoading message="Cargando bodegas..." />}
      {error && <PageMessage tone="danger">{error}</PageMessage>}

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
          <PageCard title="Sucursales">
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {sortedWarehouses.map((warehouse) => {
                const isActive = warehouse._id === selectedWarehouseId;
                const hasLocation =
                  Number.isFinite(Number(warehouse.lat)) && Number.isFinite(Number(warehouse.lng));

                return (
                  <li
                    key={warehouse._id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: isActive ? palette.navySoft : palette.border,
                      background: isActive ? palette.surfaceElevated : palette.surfaceAlt,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {warehouse.esCentral ? `★ ${warehouse.nombre}` : warehouse.nombre}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: palette.textSecondary }}>
                          {warehouse.esCentral ? 'Todas las sucursales' : warehouse.direccion || 'Sin dirección'}
                        </p>
                        {!hasLocation && (
                          <p className="mt-1 text-xs" style={{ color: palette.warningText }}>Sin coordenadas en mapa</p>
                        )}
                      </div>
                      {isActive && <StatusBadge tone="success">Activa</StatusBadge>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <PageButton
                        variant={isActive ? 'secondary' : 'primary'}
                        disabled={isActive}
                        onClick={() => handleSelectWarehouse(warehouse._id)}
                      >
                        {isActive ? 'Seleccionada' : 'Seleccionar'}
                      </PageButton>
                      {hasLocation && (
                        <PageButton variant="ghost" onClick={() => setFocusWarehouseId(warehouse._id)}>
                          Ver en mapa
                        </PageButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </PageCard>

          <PageCard title="Acciones rápidas">
            <div className="flex flex-col gap-2">
              <PageButton variant="ghost" className="justify-start" onClick={() => navigate('/loby')}>
                Ir al dashboard
              </PageButton>
              <PageButton variant="ghost" className="justify-start" onClick={() => navigate('/loby/inventory')}>
                Ver inventario de la sucursal activa
              </PageButton>
              <PageButton variant="ghost" className="justify-start" onClick={() => navigate('/loby/alerts')}>
                Ver alertas de la sucursal activa
              </PageButton>
            </div>
          </PageCard>
        </aside>
      </div>
    </PageShell>
  );
}
