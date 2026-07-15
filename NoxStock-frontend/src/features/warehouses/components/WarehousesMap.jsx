import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DEFAULT_ICON;

const DEFAULT_CENTER = [14.6349, -90.5069];
const DEFAULT_ZOOM = 12;

export default function WarehousesMap({ warehouses = [] }) {
  const ubicadas = warehouses
    .map((w) => {
      const lat = Number(w.lat);
      const lng = Number(w.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { ...w, lat, lng };
    })
    .filter(Boolean);

  const center = ubicadas.length > 0 ? [ubicadas[0].lat, ubicadas[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full rounded border"
      style={{ minHeight: '420px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {ubicadas.map((warehouse) => (
        <Marker key={warehouse._id} position={[warehouse.lat, warehouse.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{warehouse.nombre}</p>
              {warehouse.direccion && <p>{warehouse.direccion}</p>}
              <p className="text-gray-600">
                {warehouse.lat.toFixed(5)}, {warehouse.lng.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

WarehousesMap.propTypes = {
  warehouses: PropTypes.arrayOf(PropTypes.object),
};
