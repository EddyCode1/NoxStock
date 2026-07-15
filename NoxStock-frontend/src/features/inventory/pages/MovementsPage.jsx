import { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import useAuthStore from '../../../shared/stores/useAuthStore';

export default function MovementsPage() {
  const { products, entries, outputs, loadMovements, loadProducts, inventoryService } = useInventory();
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
  }, [loadMovements]);

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
      setMessage('Ingrese una cantidad válida mayor a 0');
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
      // refresh movements and products to reflect new existencias
      await Promise.all([loadMovements(), loadProducts()]);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Error al registrar movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Movimientos de Inventario</h1>
        <p className="text-sm text-gray-600 mt-1">Registra entradas y salidas de productos</p>
        {user && <p className="text-xs text-gray-500 mt-2">Usuario: <span className="font-semibold">{user.nombre || user.email}</span></p>}
      </header>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-900 rounded"></span>
          Registrar Movimiento
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleChange} 
                className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              >
                <option value="entry">Entrada</option>
                <option value="output">Salida</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <select 
                name="productId" 
                value={form.productId} 
                onChange={handleChange} 
                className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
              <input 
                name="motivo" 
                value={form.motivo} 
                onChange={handleChange} 
                placeholder="Ej: Compra, Devolución, Ajuste..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          {message && (
            <div className={`rounded p-3 text-sm ${message.includes('correctamente') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Procesando...' : 'Registrar Movimiento'}
          </button>
        </form>
      </div>

      {/* Movimientos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Entradas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Entradas
              <span className="ml-auto bg-white text-blue-900 font-bold px-2 py-1 rounded text-sm">
                {entries.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No hay entradas registradas</p>
            ) : (
              <ul className="space-y-3">
                {entries.map((entry) => (
                  <li key={entry._id} className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-3 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{entry.productId?.nombre || 'Producto'}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="text-green-700 font-bold">+{entry.cantidad} unidades</span>
                        </div>
                        {entry.motivo && (
                          <div className="text-xs text-gray-600 mt-1">
                            {entry.motivo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      {entry.fecha ? new Date(entry.fecha).toLocaleString('es-ES') : 'Sin fecha'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Salidas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Salidas
              <span className="ml-auto bg-white text-gray-800 font-bold px-2 py-1 rounded text-sm">
                {outputs.length}
              </span>
            </h2>
          </div>
          <div className="p-4">
            {outputs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No hay salidas registradas</p>
            ) : (
              <ul className="space-y-3">
                {outputs.map((output) => (
                  <li key={output._id} className="rounded-lg bg-gradient-to-r from-red-50 to-gray-50 p-3 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{output.productId?.nombre || 'Producto'}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="text-red-700 font-bold">-{output.cantidad} unidades</span>
                        </div>
                        {output.motivo && (
                          <div className="text-xs text-gray-600 mt-1">
                            {output.motivo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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
