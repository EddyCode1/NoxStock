import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [14.6349, -90.5069];
const DEFAULT_ZOOM = 13;
const DARK_TILES_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

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

const normalizePosition = (position) => {
  if (!position) return null;

  const lat = Number(position.lat);
  const lng = Number(position.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

function MapClickHandler({ onSelectPosition }) {
  useMapEvents({
    click(event) {
      onSelectPosition({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapViewController({ position }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 0);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!position) return;
    map.setView([position.lat, position.lng], Math.max(map.getZoom(), DEFAULT_ZOOM), { animate: true });
  }, [map, position]);

  return null;
}

export default function LocationPickerMap({ selectedPosition, onSelectPosition }) {
  const [useLightTiles, setUseLightTiles] = useState(false);
  const normalizedPosition = normalizePosition(selectedPosition);
  const center = normalizedPosition
    ? [normalizedPosition.lat, normalizedPosition.lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full rounded border"
      style={{ minHeight: '240px' }}
    >
      <TileLayer
        attribution={
          useLightTiles
            ? '&copy; OpenStreetMap'
            : '&copy; CARTO'
        }
        url={useLightTiles ? LIGHT_TILES_URL : DARK_TILES_URL}
        subdomains="abcd"
        maxZoom={19}
        eventHandlers={{
          tileerror: () => setUseLightTiles(true),
        }}
      />
      <MapClickHandler onSelectPosition={onSelectPosition} />
      <MapViewController position={normalizedPosition} />
      {normalizedPosition && (
        <Marker position={[normalizedPosition.lat, normalizedPosition.lng]} />
      )}
    </MapContainer>
  );
}

MapClickHandler.propTypes = {
  onSelectPosition: PropTypes.func.isRequired,
};

MapViewController.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

LocationPickerMap.propTypes = {
  selectedPosition: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onSelectPosition: PropTypes.func.isRequired,
};
