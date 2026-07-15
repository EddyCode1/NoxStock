import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NoxStockSidebar from '../components/NoxStockSidebar';
import NavbarBlack from '../components/NavbarBlack';
import inventoryService from '../../shared/api/services/inventoryService';
import useWarehouseStore from '../../shared/stores/useWarehouseStore';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const setWarehouses = useWarehouseStore((state) => state.setWarehouses);

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

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <NoxStockSidebar isOpen={isSidebarOpen} />

      <div className="ml-64 flex flex-1 flex-col overflow-hidden">
        <NavbarBlack
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
