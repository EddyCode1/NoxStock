import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

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
    if (!isReady || !selectedWarehouseId) {
      return;
    }

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

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Órdenes de compra</h1>
        <p className="text-sm text-gray-500">
          {isCentral
            ? 'OC de todas las sucursales (solo lectura)'
            : `OC de ${selectedWarehouse?.nombre || 'la bodega activa'}`}
        </p>
      </header>

      {!isCentral && (
      <form onSubmit={handleCreate} className="grid max-w-3xl gap-3 rounded border p-4 md:grid-cols-2">
        <select name="supplierId" value={form.supplierId} onChange={handleChange} className="rounded border px-3 py-2" required>
          <option value="">Proveedor *</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>{s.nombre}</option>
          ))}
        </select>
        <select name="productId" value={form.productId} onChange={handleChange} className="rounded border px-3 py-2" required>
          <option value="">Producto *</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.nombre}</option>
          ))}
        </select>
        <input name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="Cantidad *" className="rounded border px-3 py-2" required />
        <input name="precioUnitario" type="number" value={form.precioUnitario} onChange={handleChange} placeholder="Precio unitario *" className="rounded border px-3 py-2" required />
        <input name="notas" value={form.notas} onChange={handleChange} placeholder="Notas" className="rounded border px-3 py-2 md:col-span-2" />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Crear orden (borrador)
        </button>
      </form>
      )}

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order._id} className="rounded border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{order.supplierId?.nombre || 'Proveedor'}</p>
                <p className="text-sm text-gray-500">
                  {estadoLabel[order.estado] || order.estado} · {order.items?.length || 0} ítem(s)
                </p>
                {order.notas && <p className="text-sm">{order.notas}</p>}
              </div>
              <div className="flex gap-2">
                {order.estado === 'borrador' && (
                  <button type="button" onClick={() => runAction(order._id, 'send')} className="rounded border px-3 py-1 text-sm">
                    Enviar
                  </button>
                )}
                {order.estado === 'enviada' && (
                  <button type="button" onClick={() => runAction(order._id, 'receive')} className="rounded bg-black px-3 py-1 text-sm text-white">
                    Recibir
                  </button>
                )}
                {['borrador', 'enviada'].includes(order.estado) && (
                  <button type="button" onClick={() => runAction(order._id, 'cancel')} className="rounded border px-3 py-1 text-sm text-red-600">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <ul className="mt-2 text-sm text-gray-700">
              {order.items?.map((item, index) => (
                <li key={index}>
                  {item.productId?.nombre || 'Producto'} × {item.cantidad} @ Q{item.precioUnitario}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
