import { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';

export default function MovementsPage() {
  const { products, entries, outputs, loadMovements, inventoryService } = useInventory();
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

    const payload = {
      productId: form.productId,
      cantidad: Number(form.cantidad),
      motivo: form.motivo,
    };

    try {
      if (form.type === 'entry') {
        await inventoryService.registerEntry(payload);
      } else {
        await inventoryService.registerOutput(payload);
      }

      setMessage('Movimiento registrado correctamente');
      setForm((prev) => ({ ...prev, cantidad: '', motivo: '' }));
      await loadMovements();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Movimientos de inventario</h1>
        <p className="text-sm text-gray-500">Entradas y salidas conectadas al backend</p>
      </header>

      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-3 rounded border p-4 md:grid-cols-2">
        <select name="type" value={form.type} onChange={handleChange} className="rounded border px-3 py-2">
          <option value="entry">Entrada</option>
          <option value="output">Salida</option>
        </select>
        <select name="productId" value={form.productId} onChange={handleChange} className="rounded border px-3 py-2" required>
          <option value="">Seleccionar producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre} ({product.existencia})
            </option>
          ))}
        </select>
        <input name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="Cantidad" className="rounded border px-3 py-2" required />
        <input name="motivo" value={form.motivo} onChange={handleChange} placeholder="Motivo" className="rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Registrar movimiento
        </button>
      </form>

      {message && <p>{message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Entradas</h2>
          <ul className="space-y-1 text-sm">
            {entries.map((entry) => (
              <li key={entry._id}>
                {entry.productId?.nombre || 'Producto'} +{entry.cantidad}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Salidas</h2>
          <ul className="space-y-1 text-sm">
            {outputs.map((output) => (
              <li key={output._id}>
                {output.productId?.nombre || 'Producto'} -{output.cantidad}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
