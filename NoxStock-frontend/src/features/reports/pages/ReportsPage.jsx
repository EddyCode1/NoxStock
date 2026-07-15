import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [summaryData, categoriesData] = await Promise.all([
          noxReportsService.getSummary(),
          noxReportsService.getCategoriesReport(),
        ]);

        setSummary(summaryData.data || summaryData);
        setCategories(categoriesData.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar reportes');
      }
    };

    loadReports();
  }, []);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Reportes de inventario</h1>
        <p className="text-sm text-gray-500">Estructura parcial conectada a reports-service</p>
      </header>

      {error && <p className="text-red-600">{error}</p>}

      {summary && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded border p-4">Productos: {summary.inventory?.totalProducts ?? 0}</div>
          <div className="rounded border p-4">Categorías: {summary.inventory?.totalCategories ?? 0}</div>
          <div className="rounded border p-4">Unidades vendidas: {summary.inventory?.totalSoldUnits ?? 0}</div>
        </div>
      )}

      <div className="rounded border p-4">
        <h2 className="mb-2 font-semibold">Resumen por categoría</h2>
        <ul className="space-y-1 text-sm">
          {categories.map((item) => (
            <li key={item.category || item.name}>
              {item.category || item.name}: {item.totalProducts ?? item.count ?? 0} productos
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
