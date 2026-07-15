import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageSelect,
  PageButton,
  PageAlert,
  PageMessage,
  PageLoading,
  StatusBadge,
} from '../../../shared/components/ui';
import { palette } from '../../../shared/theme/noxTheme';

const estadoLabel = {
  borrador: 'Borrador',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    productId: '',
    cantidad: '',
    precioUnitario: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { selectedWarehouseId, selectedWarehouse, version, isReady, isCentral } = useWarehouse();

  const loadData = useCallback(async () => {
    if (!isReady || !selectedWarehouseId) return;
    setLoading(true);
    setError('');
    try {
      const [salesData, customersData, productsData] = await Promise.all([
        inventoryService.getSales(),
        inventoryService.getCustomers(),
        inventoryService.getProducts(),
      ]);
      setSales(salesData.sales || []);
      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [isReady, selectedWarehouseId, version]);

  useEffect(() => {
    setSales([]);
    setCustomers([]);
    setProducts([]);
    setMessage('');
    setError('');
  }, [selectedWarehouseId, version]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await inventoryService.createSale({
        customerId: form.customerId,
        notas: form.notas,
        items: [
          {
            productId: form.productId,
            cantidad: Number(form.cantidad),
            precioUnitario: Number(form.precioUnitario),
          },
        ],
      });
      setForm((prev) => ({ ...prev, cantidad: '', precioUnitario: '', notas: '' }));
      setMessage('Venta creada en borrador');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear venta');
    }
  };

  const runAction = async (id, action) => {
    setMessage('');
    setError('');
    try {
      if (action === 'confirm') await inventoryService.confirmSale(id);
      if (action === 'cancel') await inventoryService.cancelSale(id);
      setMessage(action === 'confirm' ? 'Venta confirmada' : 'Venta cancelada');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la acción de la venta');
    }
  };

  const saleTotal = (sale) =>
    (sale.items || []).reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

  const estadoTone = (estado) => {
    if (estado === 'confirmada') return 'success';
    if (estado === 'cancelada') return 'danger';
    return 'warning';
  };

  return (
    <PageShell>
      <PageHeader
        title="Ventas / Pedidos"
        subtitle={
          isCentral
            ? 'Ventas de todas las sucursales (solo lectura)'
            : `Bodega: ${selectedWarehouse?.nombre || '—'} · borrador → confirmada`
        }
      />

      {isCentral && (
        <PageAlert tone="warning">Central es solo lectura. Cambia a una sucursal para crear ventas.</PageAlert>
      )}

      {!isCentral && (
        <PageCard title="Nueva venta">
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <PageSelect name="customerId" value={form.customerId} onChange={handleChange} required>
              <option value="">Cliente *</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </PageSelect>
            <PageSelect name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Producto *</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.nombre} (stock: {p.existencia})</option>
              ))}
            </PageSelect>
            <PageInput name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="Cantidad *" required />
            <PageInput name="precioUnitario" type="number" value={form.precioUnitario} onChange={handleChange} placeholder="Precio unitario *" required />
            <PageInput name="notas" value={form.notas} onChange={handleChange} placeholder="Notas" className="md:col-span-2" />
            <div className="md:col-span-2">
              <PageButton type="submit">Crear venta (borrador)</PageButton>
            </div>
          </form>
        </PageCard>
      )}

      {message && <PageMessage tone="success">{message}</PageMessage>}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {loading && <PageLoading />}

      <div className="space-y-3">
        {sales.map((sale) => (
          <PageCard key={sale._id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{sale.customerId?.nombre || 'Cliente'}</p>
                <p className="mt-1 text-sm" style={{ color: palette.textSecondary }}>
                  <StatusBadge tone={estadoTone(sale.estado)}>{estadoLabel[sale.estado] || sale.estado}</StatusBadge>
                  <span className="ml-2">Total Q{saleTotal(sale).toFixed(2)}</span>
                </p>
                {sale.notas && <p className="mt-2 text-sm" style={{ color: palette.textMuted }}>{sale.notas}</p>}
              </div>
              {sale.estado === 'borrador' && !isCentral && (
                <div className="flex gap-2">
                  <PageButton onClick={() => runAction(sale._id, 'confirm')}>Confirmar</PageButton>
                  <PageButton variant="ghost" onClick={() => runAction(sale._id, 'cancel')}>Cancelar</PageButton>
                </div>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm" style={{ color: palette.textSecondary }}>
              {sale.items?.map((item, index) => (
                <li key={index}>
                  {item.productId?.nombre || 'Producto'} × {item.cantidad} @ Q{item.precioUnitario}
                </li>
              ))}
            </ul>
          </PageCard>
        ))}
      </div>
    </PageShell>
  );
}
