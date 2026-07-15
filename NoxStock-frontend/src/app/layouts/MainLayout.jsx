import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NoxStockSidebar from '../components/NoxStockSidebar';
import NavbarBlack from '../components/NavbarBlack';
import inventoryService from '../../shared/api/services/inventoryService';
import { useWarehouse } from '../../shared/hooks/useWarehouse';
import useWarehouseStore from '../../shared/stores/useWarehouseStore';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const setWarehouses = useWarehouseStore((state) => state.setWarehouses);
  const hasHydrated = useWarehouseStore((state) => state.hasHydrated);
  const { selectedWarehouseId, isReady } = useWarehouse();

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await inventoryService.getWarehouses();
        setWarehouses(data.warehouses || []);
      } catch (error) {
        console.error('Error cargando bodegas:', error);
      }
    };

    loadWarehouses();
  }, [setWarehouses]);

  const canRenderPages = hasHydrated && isReady && selectedWarehouseId;

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <NoxStockSidebar isOpen={isSidebarOpen} />

      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} flex flex-1 flex-col overflow-hidden transition-all duration-300`}>
        <NavbarBlack
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {canRenderPages ? (
            <Outlet key={selectedWarehouseId} />
          ) : (
            <p className="text-sm text-gray-500">Cargando contexto de bodega...</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
