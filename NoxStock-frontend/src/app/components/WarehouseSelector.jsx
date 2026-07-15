import { useWarehouse } from '../../shared/hooks/useWarehouse';
import { palette } from '../../shared/theme/noxTheme';

const WarehouseSelector = () => {
  const { warehouses, selectedWarehouseId, selectedWarehouse, isCentral, setSelectedWarehouseId } = useWarehouse();

  if (warehouses.length === 0) {
    return <span className="text-xs" style={{ color: palette.textMuted }}>Cargando bodegas...</span>;
  }

  const sortedWarehouses = [...warehouses].sort((a, b) => {
    if (a.esCentral) return -1;
    if (b.esCentral) return 1;
    return a.nombre.localeCompare(b.nombre, 'es');
  });

  return (
    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="warehouse-selector" className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textSecondary }}>
        Bodega activa
      </label>
      <select
        id="warehouse-selector"
        value={selectedWarehouseId || ''}
        onChange={(event) => setSelectedWarehouseId(event.target.value)}
        className="min-w-[220px] rounded-full px-4 py-2 text-sm outline-none"
        style={{
          background: palette.surfaceAlt,
          border: `1px solid ${palette.border}`,
          color: palette.textPrimary,
        }}
      >
        {sortedWarehouses.map((warehouse) => (
          <option key={warehouse._id} value={warehouse._id}>
            {warehouse.esCentral ? `★ ${warehouse.nombre} (todas las sucursales)` : warehouse.nombre}
          </option>
        ))}
      </select>
      {isCentral ? (
        <span className="hidden text-xs lg:inline" style={{ color: palette.warningText }}>
          Vista consolidada
        </span>
      ) : selectedWarehouse?.direccion ? (
        <span className="hidden text-xs lg:inline" style={{ color: palette.textMuted }}>
          {selectedWarehouse.direccion}
        </span>
      ) : null}
    </div>
  );
};

export default WarehouseSelector;
