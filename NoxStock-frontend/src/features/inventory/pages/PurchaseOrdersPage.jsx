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
  enviada: 'Enviada',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplierId: '',
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
      const [ordersData, suppliersData, productsData] = await Promise.all([
        inventoryService.getPurchaseOrders(),
        inventoryService.getSuppliers(),
        inventoryService.getProducts(),
      ]);
      setOrders(ordersData.orders || []);
      setSuppliers(suppliersData.suppliers || []);
      setProducts(productsData.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [isReady, selectedWarehouseId, version]);

  useEffect(() => {
    setOrders([]);
    setSuppliers([]);
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
      await inventoryService.createPurchaseOrder({
        supplierId: form.supplierId,
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
      setMessage('Orden de compra creada en borrador');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear orden');
    }
  };

  const runAction = async (id, action) => {
    setMessage('');
    setError('');
    try {
      if (action === 'send') await inventoryService.sendPurchaseOrder(id);
      if (action === 'receive') await inventoryService.receivePurchaseOrder(id);
      if (action === 'cancel') await inventoryService.cancelPurchaseOrder(id);
      setMessage(`Orden ${action === 'send' ? 'enviada' : action === 'receive' ? 'recibida' : 'cancelada'}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la acción de la orden');
    }
  };

  const estadoTone = (estado) => {
    if (estado === 'recibida') return 'success';
    if (estado === 'cancelada') return 'danger';
    if (estado === 'enviada') return 'navy';
    return 'warning';
  };

  return (
    <PageShell>
      <PageHeader
        title="Órdenes de compra"
        subtitle={
          isCentral
            ? 'OC de todas las sucursales (solo lectura)'
            : `OC de ${selectedWarehouse?.nombre || 'la bodega activa'}`
        }
      />

      {isCentral && <PageAlert tone="warning">Central es solo lectura para órdenes de compra.</PageAlert>}

      {!isCentral && (
        <PageCard title="Nueva orden">
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <PageSelect name="supplierId" value={form.supplierId} onChange={handleChange} required>
              <option value="">Proveedor *</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.nombre}</option>
              ))}
            </PageSelect>
            <PageSelect name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Producto *</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.nombre}</option>
              ))}
            </PageSelect>
            <PageInput name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="Cantidad *" required />
            <PageInput name="precioUnitario" type="number" value={form.precioUnitario} onChange={handleChange} placeholder="Precio unitario *" required />
            <PageInput name="notas" value={form.notas} onChange={handleChange} placeholder="Notas" className="md:col-span-2" />
            <div className="md:col-span-2">
              <PageButton type="submit">Crear orden (borrador)</PageButton>
            </div>
          </form>
        </PageCard>
      )}

      {message && <PageMessage tone="success">{message}</PageMessage>}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {loading && <PageLoading />}

      <div className="space-y-3">
        {orders.map((order) => (
          <PageCard key={order._id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{order.supplierId?.nombre || 'Proveedor'}</p>
                <p className="mt-1 text-sm" style={{ color: palette.textSecondary }}>
                  <StatusBadge tone={estadoTone(order.estado)}>{estadoLabel[order.estado] || order.estado}</StatusBadge>
                  <span className="ml-2">{order.items?.length || 0} ítem(s)</span>
                </p>
                {order.notas && <p className="mt-2 text-sm" style={{ color: palette.textMuted }}>{order.notas}</p>}
              </div>
              {!isCentral && (
                <div className="flex flex-wrap gap-2">
                  {order.estado === 'borrador' && (
                    <PageButton variant="secondary" onClick={() => runAction(order._id, 'send')}>Enviar</PageButton>
                  )}
                  {order.estado === 'enviada' && (
                    <PageButton onClick={() => runAction(order._id, 'receive')}>Recibir</PageButton>
                  )}
                  {['borrador', 'enviada'].includes(order.estado) && (
                    <PageButton variant="ghost" onClick={() => runAction(order._id, 'cancel')}>Cancelar</PageButton>
                  )}
                </div>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm" style={{ color: palette.textSecondary }}>
              {order.items?.map((item, index) => (
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
