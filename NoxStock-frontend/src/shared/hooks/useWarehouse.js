import { useMemo } from 'react';
import useWarehouseStore from '../stores/useWarehouseStore';

export function useWarehouse() {
  const warehouses = useWarehouseStore((state) => state.warehouses);
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const version = useWarehouseStore((state) => state.version);
  const isReady = useWarehouseStore((state) => state.isReady);
  const setSelectedWarehouseId = useWarehouseStore((state) => state.setSelectedWarehouseId);

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse) => warehouse._id === selectedWarehouseId) || null,
    [warehouses, selectedWarehouseId]
  );

  const isCentral = Boolean(selectedWarehouse?.esCentral);

  return {
    warehouses,
    selectedWarehouseId,
    selectedWarehouse,
    isCentral,
    version,
    isReady,
    setSelectedWarehouseId,
  };
}

export default useWarehouse;
