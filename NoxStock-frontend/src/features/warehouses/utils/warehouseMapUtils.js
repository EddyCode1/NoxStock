import L from 'leaflet';

export const DEFAULT_MAP_CENTER = [14.6349, -90.5069];
export const DEFAULT_MAP_ZOOM = 11;

export function normalizeWarehouseLocation(warehouse) {
  const lat = Number(warehouse?.lat);
  const lng = Number(warehouse?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { ...warehouse, lat, lng };
}

export function sortWarehousesForDisplay(warehouses = []) {
  return [...warehouses].sort((a, b) => {
    if (a.esCentral) return -1;
    if (b.esCentral) return 1;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

export function createWarehouseMarkerIcon({ isCentral = false, isSelected = false } = {}) {
  const background = isCentral ? '#d97706' : isSelected ? '#15803d' : '#1e3a8a';
  const border = isSelected ? '#86efac' : '#ffffff';
  const symbol = isCentral ? '★' : '●';

  return L.divIcon({
    className: 'noxstock-warehouse-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${background};
        border: 3px solid ${border};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isCentral ? '16px' : '10px'};
        font-weight: 700;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">${symbol}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}
