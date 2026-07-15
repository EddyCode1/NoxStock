import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NoxStockSidebar from '../components/NoxStockSidebar';
import NavbarBlack from '../components/NavbarBlack';
import PageTransition from '../../shared/components/PageTransition';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <NoxStockSidebar isOpen={isSidebarOpen} />

      <div className="ml-64 flex flex-1 flex-col overflow-hidden">
        <NavbarBlack
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
