import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';

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
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());

  const loadData = useCallback(async () => {
    if (!selectedWarehouseId) {
      return;
    }

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
  }, [selectedWarehouseId]);

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

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ventas / Pedidos</h1>
        <p className="text-sm text-gray-500">
          Bodega: {selectedWarehouse?.nombre || '—'} · borrador → confirmada (descuenta stock)
        </p>
      </header>

      <form onSubmit={handleCreate} className="grid max-w-3xl gap-3 rounded border p-4 md:grid-cols-2">
        <select name="customerId" value={form.customerId} onChange={handleChange} className="rounded border px-3 py-2" required>
          <option value="">Cliente *</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
        <select name="productId" value={form.productId} onChange={handleChange} className="rounded border px-3 py-2" required>
          <option value="">Producto *</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.nombre} (stock: {p.existencia})</option>
          ))}
        </select>
        <input name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="Cantidad *" className="rounded border px-3 py-2" required />
        <input name="precioUnitario" type="number" value={form.precioUnitario} onChange={handleChange} placeholder="Precio unitario *" className="rounded border px-3 py-2" required />
        <input name="notas" value={form.notas} onChange={handleChange} placeholder="Notas" className="rounded border px-3 py-2 md:col-span-2" />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Crear venta (borrador)
        </button>
      </form>

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="space-y-3">
        {sales.map((sale) => (
          <article key={sale._id} className="rounded border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{sale.customerId?.nombre || 'Cliente'}</p>
                <p className="text-sm text-gray-500">
                  {estadoLabel[sale.estado] || sale.estado} · Total Q{saleTotal(sale).toFixed(2)}
                </p>
                {sale.notas && <p className="text-sm">{sale.notas}</p>}
              </div>
              <div className="flex gap-2">
                {sale.estado === 'borrador' && (
                  <>
                    <button type="button" onClick={() => runAction(sale._id, 'confirm')} className="rounded bg-black px-3 py-1 text-sm text-white">
                      Confirmar
                    </button>
                    <button type="button" onClick={() => runAction(sale._id, 'cancel')} className="rounded border px-3 py-1 text-sm text-red-600">
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
            <ul className="mt-2 text-sm text-gray-700">
              {sale.items?.map((item, index) => (
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
