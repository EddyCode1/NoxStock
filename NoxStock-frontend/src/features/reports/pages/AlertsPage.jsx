import { useEffect, useMemo, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

const palette = {
  background: '#071524',
  container: '#12233D',
  border: '#1F2F53',
  card: '#0E203C',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  accent: '#3B82F6',
  badgeWarning: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  badgeCritical: 'bg-slate-500/10 text-slate-200 border-slate-500/20',
};

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedWarehouseId, selectedWarehouse, version, isReady } = useWarehouse();

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
      return;
    }

    const loadAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [lowStockRes, outOfStockRes] = await Promise.all([
          noxReportsService.getLowStockAlerts(),
          noxReportsService.getOutOfStockAlerts(),
        ]);

        setLowStock(lowStockRes?.data || []);
        setOutOfStock(outOfStockRes?.data || []);
      } catch (err) {
        console.error('Error al cargar alertas:', err);
        setError(err?.response?.data?.message || err?.message || 'Error al cargar alertas');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [isReady, selectedWarehouseId, version]);

  const tableData = useMemo(
    () => [
      ...lowStock.map((item) => ({
        id: item.id || `${item.name}-low`,
        name: item.name || 'Producto',
        category: item.category || 'General',
        stock: item.stock ?? 0,
        type: 'Bajo stock',
        state: 'Advertencia',
        badgeClass: palette.badgeWarning,
      })),
      ...outOfStock.map((item) => ({
        id: item.id || `${item.name}-out`,
        name: item.name || 'Producto',
        category: item.category || 'General',
        stock: item.stock ?? 0,
        type: 'Agotado',
        state: 'Crítico',
        badgeClass: palette.badgeCritical,
      })),
    ],
    [lowStock, outOfStock],
  );

  return (
    <div style={{ background: palette.background, color: palette.textPrimary }} className="min-h-full rounded-[2rem] p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-sky-300/70">Alertas</p>
            <h1 className="text-3xl font-semibold">Inventario con atención</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Revisa los productos en bajo stock y los artículos agotados en {selectedWarehouse?.nombre || 'la bodega activa'}.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-3xl border border-red-800/80 bg-[#2B1D25] px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-700 bg-[#102A4F] p-5 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.55)]">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Total alertas</div>
            <div className="mt-4 text-3xl font-semibold text-slate-100">{tableData.length}</div>
          </div>
          <div className="rounded-[1.75rem] border border-slate-700 bg-[#102A4F] p-5 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.55)]">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Bajo stock</div>
            <div className="mt-4 text-3xl font-semibold text-slate-100">{lowStock.length}</div>
          </div>
          <div className="rounded-[1.75rem] border border-slate-700 bg-[#102A4F] p-5 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.55)]">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Agotados</div>
            <div className="mt-4 text-3xl font-semibold text-slate-100">{outOfStock.length}</div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-700 bg-[#111E36] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Resumen de alertas</h2>
              <p className="mt-1 text-sm text-slate-400">Panel en tiempo real conectado a reports-service e inventory-service.</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
              Mostrando {tableData.length} artículos
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-700 bg-[#111E36] shadow-[0_20px_80px_-55px_rgba(0,0,0,0.7)]">
            <table className="min-w-full">
              <thead className="bg-[#0E1A34]">
                <tr>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Producto</th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Categoría</th>
                  <th className="px-4 py-4 text-right text-xs uppercase tracking-[0.18em] text-slate-500">Stock</th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Tipo</th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-[0.18em] text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">Cargando alertas...</td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No hay alertas disponibles.</td>
                  </tr>
                ) : (
                  tableData.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700 last:border-b-0 hover:bg-[#14294C]">
                      <td className="px-4 py-4 text-sm text-slate-100">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{item.category}</td>
                      <td className="px-4 py-4 text-right text-sm text-slate-100">{item.stock}</td>
                      <td className="px-4 py-4 text-sm text-slate-100">{item.type}</td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={`${item.badgeClass} inline-flex rounded-full border px-3 py-1 text-xs font-semibold`}>
                          {item.state}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
