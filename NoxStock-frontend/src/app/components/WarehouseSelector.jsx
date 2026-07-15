import { useWarehouse } from '../../shared/hooks/useWarehouse';

const WarehouseSelector = () => {
  const { warehouses, selectedWarehouseId, selectedWarehouse, isCentral, setSelectedWarehouseId } = useWarehouse();

  if (warehouses.length === 0) {
    return (
      <span className="text-xs text-gray-500">Cargando bodegas...</span>
    );
  }

  const sortedWarehouses = [...warehouses].sort((a, b) => {
    if (a.esCentral) return -1;
    if (b.esCentral) return 1;
    return a.nombre.localeCompare(b.nombre, 'es');
  });

  return (
    <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
      <label htmlFor="warehouse-selector" className="text-xs uppercase tracking-wider text-gray-400">
        Bodega activa
      </label>
      <select
        id="warehouse-selector"
        value={selectedWarehouseId || ''}
        onChange={(event) => setSelectedWarehouseId(event.target.value)}
        className="min-w-[220px] rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-gray-400 focus:outline-none"
      >
        {sortedWarehouses.map((warehouse) => (
          <option key={warehouse._id} value={warehouse._id}>
            {warehouse.esCentral ? `★ ${warehouse.nombre} (todas las sucursales)` : warehouse.nombre}
          </option>
        ))}
      </select>
      {isCentral ? (
        <span className="hidden text-xs text-amber-400 lg:inline">
          Vista consolidada de todas las sucursales
        </span>
      ) : selectedWarehouse?.direccion ? (
        <span className="hidden text-xs text-gray-500 lg:inline">
          {selectedWarehouse.direccion}
        </span>
      ) : null}
    </div>
  );
};

export default WarehouseSelector;
