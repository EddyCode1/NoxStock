import { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import useAuthStore from '../../../shared/stores/useAuthStore';

export default function MovementsPage() {
  const { products, entries, outputs, loadMovements, loadProducts, inventoryService } = useInventory();
  const { selectedWarehouse, selectedWarehouseId, version, isCentral } = useWarehouse();
  const user = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'entry',
    productId: '',
    cantidad: '',
    motivo: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMovements();
  }, [loadMovements, version]);

  useEffect(() => {
    setForm({ type: 'entry', productId: '', cantidad: '', motivo: '' });
    setMessage('');
  }, [selectedWarehouseId, version]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.productId) {
      setMessage('Seleccione un producto');
      return;
    }

    const cantidad = Number(form.cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMessage('Ingrese una cantidad v├ílida mayor a 0');
      return;
    }

    const payload = {
      productId: form.productId,
      cantidad,
      motivo: form.motivo,
    };

    try {
      setSubmitting(true);

      if (form.type === 'entry') {
        await inventoryService.registerEntry(payload);
      } else {
        await inventoryService.registerOutput(payload);
      }

      setMessage('Movimiento registrado correctamente');
      setForm((prev) => ({ ...prev, cantidad: '', motivo: '' }));
      await Promise.all([loadMovements(), loadProducts()]);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Error al registrar movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 rounded-lg bg-gray-50 p-6">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Movimientos de Inventario</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isCentral
            ? 'Historial consolidado de todas las sucursales (solo lectura)'
            : `Entradas y salidas en ${selectedWarehouse?.nombre || 'la bodega activa'}`}
        </p>
        {user && (
          <p className="mt-2 text-xs text-gray-500">
            Usuario: <span className="font-semibold">{user.nombre || user.email}</span>
          </p>
        )}
      </header>

      {!isCentral && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="h-6 w-1 rounded bg-blue-900" />
            Registrar Movimiento
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Tipo de Movimiento</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                >
                  <option value="entry">Entrada</option>
                  <option value="output">Salida</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Producto</label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  required
                >
                  <option value="">-- Seleccionar producto --</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.nombre} (Stock: {product.existencia})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  name="cantidad"
                  type="number"
                  value={form.cantidad}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Motivo</label>
                <input
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  placeholder="Ej: Compra, Devoluci├│n, Ajuste..."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded p-3 text-sm ${
                  message.includes('correctamente')
                    ? 'border border-green-200 bg-green-50 text-green-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-900 px-4 py-2 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Procesando...' : 'Registrar Movimiento'}
            </button>
          </form>
        </div>
      )}

      {isCentral && (
        <p className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Para registrar movimientos, seleccione una sucursal operativa (no Central).
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              Entradas
              <span className="ml-auto rounded bg-white px-2 py-1 text-sm font-bold text-blue-900">
                {entries.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {entries.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No hay entradas registradas</p>
            ) : (
              <ul className="space-y-3">
                {entries.map((entry) => (
                  <li
                    key={entry._id}
                    className="rounded-lg border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{entry.productId?.nombre || 'Producto'}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="font-bold text-green-700">+{entry.cantidad} unidades</span>
                        </div>
                        {entry.motivo && <div className="mt-1 text-xs text-gray-600">{entry.motivo}</div>}
                        {entry.registradoPor && (
                          <div className="mt-1 text-xs text-gray-500">Por: {entry.registradoPor}</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      {entry.fecha ? new Date(entry.fecha).toLocaleString('es-ES') : 'Sin fecha'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              Salidas
              <span className="ml-auto rounded bg-white px-2 py-1 text-sm font-bold text-gray-800">
                {outputs.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {outputs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No hay salidas registradas</p>
            ) : (
              <ul className="space-y-3">
                {outputs.map((output) => (
                  <li
                    key={output._id}
                    className="rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-gray-50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{output.productId?.nombre || 'Producto'}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="font-bold text-red-700">-{output.cantidad} unidades</span>
                        </div>
                        {output.motivo && <div className="mt-1 text-xs text-gray-600">{output.motivo}</div>}
                        {output.registradoPor && (
                          <div className="mt-1 text-xs text-gray-500">Por: {output.registradoPor}</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      {output.fecha ? new Date(output.fecha).toLocaleString('es-ES') : 'Sin fecha'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
