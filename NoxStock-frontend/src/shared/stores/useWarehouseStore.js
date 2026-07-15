import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWarehouseStore = create(
  persist(
    (set, get) => ({
      warehouses: [],
      selectedWarehouseId: null,
      loading: false,

      setWarehouses: (warehouses) => {
        const list = Array.isArray(warehouses) ? warehouses : [];
        const currentId = get().selectedWarehouseId;
        const isValid = list.some((warehouse) => warehouse._id === currentId);

        set({
          warehouses: list,
          selectedWarehouseId: isValid ? currentId : list[0]?._id || null,
        });
      },

      setSelectedWarehouseId: (warehouseId) => set({ selectedWarehouseId: warehouseId }),

      getSelectedWarehouse: () => {
        const { warehouses, selectedWarehouseId } = get();
        return warehouses.find((warehouse) => warehouse._id === selectedWarehouseId) || null;
      },
    }),
    {
      name: 'noxstock-warehouse',
      partialize: (state) => ({ selectedWarehouseId: state.selectedWarehouseId }),
    }
  )
);

export default useWarehouseStore;
