import useWarehouseStore from '../../shared/stores/useWarehouseStore';

const WarehouseSelector = () => {
  const warehouses = useWarehouseStore((state) => state.warehouses);
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const setSelectedWarehouseId = useWarehouseStore((state) => state.setSelectedWarehouseId);
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());

  if (warehouses.length === 0) {
    return (
      <span className="text-xs text-gray-500">Sin bodegas</span>
    );
  }

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
        {warehouses.map((warehouse) => (
          <option key={warehouse._id} value={warehouse._id}>
            {warehouse.nombre}
          </option>
        ))}
      </select>
      {selectedWarehouse?.direccion && (
        <span className="hidden text-xs text-gray-500 lg:inline">
          {selectedWarehouse.direccion}
        </span>
      )}
    </div>
  );
};

export default WarehouseSelector;
