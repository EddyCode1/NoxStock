import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';
import { sortWarehousesForDisplay } from '../utils/warehouseMapUtils';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageButton,
  PageLinkButton,
  PageTable,
  PageTableHead,
  PageTableRow,
  PageTableCell,
  PageTableHeaderCell,
  PageMessage,
  PageLoading,
  StatusBadge,
} from '../../../shared/components/ui';
import { palette } from '../../../shared/theme/noxTheme';

const LocationPickerMap = lazy(() => import('../components/LocationPickerMap'));

const emptyForm = { nombre: '', direccion: '', lat: '', lng: '' };

function MapLoader() {
  return (
    <div
      className="flex h-60 items-center justify-center rounded-2xl border text-sm"
      style={{ borderColor: palette.border, color: palette.textMuted, background: palette.surfaceAlt }}
    >
      Cargando mapa…
    </div>
  );
}

export default function WarehousesPage() {
  const { selectedWarehouseId, setSelectedWarehouseId } = useWarehouse();
  const setWarehousesStore = useWarehouseStore((state) => state.setWarehouses);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getWarehouses();
      const list = data.warehouses || [];
      setWarehouses(list);
      setWarehousesStore(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar bodegas');
    } finally {
      setLoading(false);
    }
  }, [setWarehousesStore]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPosition = ({ lat, lng }) => {
    setPosition({ lat, lng });
    setForm((prev) => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!form.lat || !form.lng) {
      setError('Selecciona la ubicación en el mapa');
      return;
    }
    try {
      await inventoryService.createWarehouse({
        nombre: form.nombre,
        direccion: form.direccion,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });
      setForm(emptyForm);
      setPosition(null);
      setMessage('Bodega registrada correctamente');
      await loadWarehouses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear bodega');
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Bodegas / Sucursales"
        subtitle="Registra ubicaciones con mapa (Leaflet + OpenStreetMap)"
        actions={<PageLinkButton to="/loby/inventory/warehouses/map" variant="secondary">Ver mapa general</PageLinkButton>}
      />

      <PageCard title="Nueva bodega">
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <PageInput name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre de bodega *" required />
            <PageInput name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
            <div className="grid grid-cols-2 gap-2">
              <PageInput name="lat" value={form.lat} readOnly placeholder="Latitud" />
              <PageInput name="lng" value={form.lng} readOnly placeholder="Longitud" />
            </div>
            <p className="text-xs" style={{ color: palette.textMuted }}>Haz clic en el mapa para fijar la ubicación</p>
            <PageButton type="submit">Registrar bodega</PageButton>
          </div>
          <Suspense fallback={<MapLoader />}>
            <LocationPickerMap selectedPosition={position} onSelectPosition={handleSelectPosition} />
          </Suspense>
        </form>
      </PageCard>

      {message && <PageMessage tone="success">{message}</PageMessage>}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {loading && <PageLoading />}

      <PageTable>
        <PageTableHead>
          <tr>
            <PageTableHeaderCell>Nombre</PageTableHeaderCell>
            <PageTableHeaderCell>Dirección</PageTableHeaderCell>
            <PageTableHeaderCell>Coordenadas</PageTableHeaderCell>
            <PageTableHeaderCell align="center">Acciones</PageTableHeaderCell>
          </tr>
        </PageTableHead>
        <tbody>
          {sortWarehousesForDisplay(warehouses).map((warehouse) => {
            const isActive = warehouse._id === selectedWarehouseId;
            return (
              <PageTableRow key={warehouse._id} highlight={isActive}>
                <PageTableCell>{warehouse.esCentral ? `★ ${warehouse.nombre}` : warehouse.nombre}</PageTableCell>
                <PageTableCell>{warehouse.direccion || '—'}</PageTableCell>
                <PageTableCell>
                  {Number(warehouse.lat).toFixed(5)}, {Number(warehouse.lng).toFixed(5)}
                </PageTableCell>
                <PageTableCell align="center">
                  {isActive ? (
                    <StatusBadge tone="success">Activa</StatusBadge>
                  ) : (
                    <PageButton variant="secondary" onClick={() => setSelectedWarehouseId(warehouse._id)}>
                      Seleccionar
                    </PageButton>
                  )}
                </PageTableCell>
              </PageTableRow>
            );
          })}
        </tbody>
      </PageTable>
    </PageShell>
  );
}
