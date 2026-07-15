import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createWarehouseMarkerIcon,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  normalizeWarehouseLocation,
} from '../utils/warehouseMapUtils';

function MapBoundsFitter({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }

    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, positions]);

  return null;
}

function MapFocusController({ focusPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!focusPosition) return;
    map.flyTo(focusPosition, Math.max(map.getZoom(), 14), { duration: 0.7 });
  }, [map, focusPosition]);

  return null;
}

MapBoundsFitter.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

MapFocusController.propTypes = {
  focusPosition: PropTypes.arrayOf(PropTypes.number),
};

export default function WarehousesMap({
  warehouses = [],
  selectedWarehouseId = null,
  focusWarehouseId = null,
  onSelectWarehouse,
}) {
  const ubicadas = warehouses.map(normalizeWarehouseLocation).filter(Boolean);
  const positions = ubicadas.map((warehouse) => [warehouse.lat, warehouse.lng]);
  const focusWarehouse = ubicadas.find((warehouse) => warehouse._id === focusWarehouseId);
  const focusPosition = focusWarehouse ? [focusWarehouse.lat, focusWarehouse.lng] : null;
  const center = positions.length > 0 ? positions[0] : DEFAULT_MAP_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_MAP_ZOOM}
      className="h-full w-full rounded-lg border border-gray-200 shadow-sm"
      style={{ minHeight: '480px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <MapBoundsFitter positions={positions} />
      <MapFocusController focusPosition={focusPosition} />

      {ubicadas.map((warehouse) => {
        const isSelected = warehouse._id === selectedWarehouseId;

        return (
          <Marker
            key={warehouse._id}
            position={[warehouse.lat, warehouse.lng]}
            icon={createWarehouseMarkerIcon({
              isCentral: warehouse.esCentral,
              isSelected,
            })}
          >
            <Popup minWidth={240} className="noxstock-warehouse-popup">
              <div className="space-y-3 text-sm text-gray-800">
                <div>
                  <p className="text-base font-bold text-blue-900">{warehouse.nombre}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      warehouse.esCentral
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {warehouse.esCentral ? 'Vista consolidada' : 'Sucursal operativa'}
                  </span>
                </div>

                {warehouse.direccion && (
                  <p className="text-gray-600">{warehouse.direccion}</p>
                )}

                <p className="font-mono text-xs text-gray-500">
                  {warehouse.lat.toFixed(5)}, {warehouse.lng.toFixed(5)}
                </p>

                {isSelected ? (
                  <p className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800">
                    Bodega activa en el sistema
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectWarehouse?.(warehouse._id)}
                    className="w-full rounded bg-blue-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                  >
                    {warehouse.esCentral ? 'Ver todas las sucursales' : 'Trabajar en esta sucursal'}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

WarehousesMap.propTypes = {
  warehouses: PropTypes.arrayOf(PropTypes.object),
  selectedWarehouseId: PropTypes.string,
  focusWarehouseId: PropTypes.string,
  onSelectWarehouse: PropTypes.func,
};
