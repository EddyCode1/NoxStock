import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import Reveal from '../../../shared/components/Reveal';


export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsData, lowStockData, outOfStockData] = await Promise.all([
          inventoryService.getProducts(),
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        setStats({
          products: productsData.total || productsData.products?.length || 0,
          lowStock: lowStockData.count || lowStockData.data?.length || 0,
          outOfStock: outOfStockData.count || outOfStockData.data?.length || 0,
        });
      } catch (error) {
        console.error('Dashboard stats error:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard NoxStock</h1>
        <p className="text-sm text-gray-500">Resumen parcial conectado a los microservicios</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">Productos: {stats.products}</div>
        <div className="rounded border p-4">Bajo stock: {stats.lowStock}</div>
        <div className="rounded border p-4">Agotados: {stats.outOfStock}</div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/loby/inventory" className="rounded border px-4 py-2">Ver productos</Link>
        <Link to="/loby/inventory/movements" className="rounded border px-4 py-2">Movimientos</Link>
        <Link to="/loby/reports" className="rounded border px-4 py-2">Reportes</Link>
        <Link to="/loby/alerts" className="rounded border px-4 py-2">Alertas</Link>
      </div>
    </section>
  );
}
