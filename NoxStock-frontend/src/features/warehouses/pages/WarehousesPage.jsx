import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';

const LocationPickerMap = lazy(() => import('../components/LocationPickerMap'));

const emptyForm = {
  nombre: '',
  direccion: '',
  lat: '',
  lng: '',
};

function MapLoader() {
  return <div className="flex h-60 items-center justify-center rounded border text-sm text-gray-500">Cargando mapa…</div>;
}

export default function WarehousesPage() {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPosition = ({ lat, lng }) => {
    setPosition({ lat, lng });
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
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
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bodegas / Sucursales</h1>
          <p className="text-sm text-gray-500">Registra ubicaciones con mapa (Leaflet + OpenStreetMap)</p>
        </div>
        <Link to="/loby/inventory/warehouses/map" className="rounded border px-4 py-2 text-sm">
          Ver mapa general
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded border p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de bodega *"
            className="w-full rounded border px-3 py-2"
            required
          />
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            className="w-full rounded border px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input name="lat" value={form.lat} readOnly placeholder="Latitud" className="rounded border bg-gray-50 px-3 py-2" />
            <input name="lng" value={form.lng} readOnly placeholder="Longitud" className="rounded border bg-gray-50 px-3 py-2" />
          </div>
          <p className="text-xs text-gray-500">Haz clic en el mapa para fijar la ubicación</p>
          <button type="submit" className="rounded bg-black px-4 py-2 text-white">
            Registrar bodega
          </button>
        </div>

        <Suspense fallback={<MapLoader />}>
          <LocationPickerMap selectedPosition={position} onSelectPosition={handleSelectPosition} />
        </Suspense>
      </form>

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Dirección</th>
              <th className="px-3 py-2 text-left">Coordenadas</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse._id} className="border-t">
                <td className="px-3 py-2">{warehouse.nombre}</td>
                <td className="px-3 py-2">{warehouse.direccion || '-'}</td>
                <td className="px-3 py-2">
                  {Number(warehouse.lat).toFixed(5)}, {Number(warehouse.lng).toFixed(5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
