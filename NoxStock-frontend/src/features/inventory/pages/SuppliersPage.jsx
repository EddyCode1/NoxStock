import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';

const emptyForm = {
  nombre: '',
  contacto: '',
  email: '',
  telefono: '',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getSuppliers();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await inventoryService.createSupplier(form);
      setForm(emptyForm);
      setMessage('Proveedor creado correctamente');
      await loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear proveedor');
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <p className="text-sm text-gray-500">CRUD simple conectado a /suppliers</p>
      </header>

      <form onSubmit={handleSubmit} className="grid max-w-3xl gap-3 rounded border p-4 md:grid-cols-2">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre *" className="rounded border px-3 py-2" required />
        <input name="contacto" value={form.contacto} onChange={handleChange} placeholder="Contacto" className="rounded border px-3 py-2" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="rounded border px-3 py-2" />
        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">
          Agregar proveedor
        </button>
      </form>

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Contacto</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id} className="border-t">
                <td className="px-3 py-2">{supplier.nombre}</td>
                <td className="px-3 py-2">{supplier.contacto || '-'}</td>
                <td className="px-3 py-2">{supplier.email || '-'}</td>
                <td className="px-3 py-2">{supplier.telefono || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
