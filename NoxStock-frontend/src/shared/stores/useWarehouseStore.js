import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWarehouseStore = create(
  persist(
    (set, get) => ({
      warehouses: [],
      selectedWarehouseId: null,
      version: 0,
      isReady: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setWarehouses: (warehouses) => {
        const list = Array.isArray(warehouses) ? warehouses : [];
        const currentId = get().selectedWarehouseId;
        const isValid = list.some((warehouse) => warehouse._id === currentId);
        const centralWarehouse = list.find((warehouse) => warehouse.esCentral);
        const nextId = isValid ? currentId : centralWarehouse?._id || list[0]?._id || null;
        const warehouseChanged = nextId !== currentId;

        set({
          warehouses: list,
          selectedWarehouseId: nextId,
          isReady: list.length > 0 && Boolean(nextId),
          version: warehouseChanged ? get().version + 1 : get().version,
        });
      },

      setSelectedWarehouseId: (warehouseId) => {
        const currentId = get().selectedWarehouseId;

        if (!warehouseId || warehouseId === currentId) {
          return;
        }

        const exists = get().warehouses.some((warehouse) => warehouse._id === warehouseId);

        if (!exists) {
          return;
        }

        set({
          selectedWarehouseId: warehouseId,
          version: get().version + 1,
        });
      },
    }),
    {
      name: 'noxstock-warehouse',
      partialize: (state) => ({ selectedWarehouseId: state.selectedWarehouseId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useWarehouseStore;
