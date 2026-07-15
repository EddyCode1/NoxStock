import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';

const emptyForm = {
  nombre: '',
  email: '',
  telefono: '',
  nit: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { selectedWarehouseId, selectedWarehouse, version, isReady, isCentral } = useWarehouse();

  const loadCustomers = useCallback(async () => {
    if (!isReady || !selectedWarehouseId) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [isReady, selectedWarehouseId, version]);

  useEffect(() => {
    setCustomers([]);
    setForm(emptyForm);
    setMessage('');
    setError('');
  }, [selectedWarehouseId, version]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await inventoryService.createCustomer(form);
      setForm(emptyForm);
      setMessage('Cliente creado correctamente');
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cliente');
    }
  };

  return (
    <section className="space-y-6 rounded-lg bg-gray-50 p-6">
      <header className="border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Clientes</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isCentral
            ? 'Clientes de todas las sucursales (solo lectura)'
            : `Clientes de ${selectedWarehouse?.nombre || 'la bodega activa'}`}
        </p>
      </header>

      {isCentral && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          En Central ves el consolidado. Para registrar clientes, selecciona una sucursal operativa.
        </p>
      )}

      {!isCentral && (
        <form onSubmit={handleSubmit} className="grid max-w-3xl gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre *" className="rounded border px-3 py-2" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="rounded border px-3 py-2" />
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="rounded border px-3 py-2" />
          <input name="nit" value={form.nit} onChange={handleChange} placeholder="NIT" className="rounded border px-3 py-2" />
          <button type="submit" className="rounded bg-blue-900 px-4 py-2 text-white md:col-span-2">
            Agregar cliente
          </button>
        </form>
      )}

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Cargando clientes...</p>}

      {!loading && !error && customers.length === 0 && (
        <p className="text-sm text-gray-500">
          {isCentral
            ? 'No hay clientes registrados en las sucursales.'
            : 'Esta sucursal aún no tiene clientes.'}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Teléfono</th>
              <th className="px-3 py-2 text-left">NIT</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t">
                <td className="px-3 py-2">{customer.nombre}</td>
                <td className="px-3 py-2">{customer.email || '-'}</td>
                <td className="px-3 py-2">{customer.telefono || '-'}</td>
                <td className="px-3 py-2">{customer.nit || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
