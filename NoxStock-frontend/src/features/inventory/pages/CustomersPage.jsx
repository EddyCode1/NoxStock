import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageButton,
  PageTable,
  PageTableHead,
  PageTableRow,
  PageTableCell,
  PageTableHeaderCell,
  PageAlert,
  PageMessage,
  PageLoading,
  PageEmpty,
} from '../../../shared/components/ui';

const emptyForm = { nombre: '', email: '', telefono: '', nit: '' };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { selectedWarehouseId, selectedWarehouse, version, isReady, isCentral } = useWarehouse();

  const loadCustomers = useCallback(async () => {
    if (!isReady || !selectedWarehouseId) return;
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
    <PageShell>
      <PageHeader
        title="Clientes"
        subtitle={
          isCentral
            ? 'Clientes de todas las sucursales (solo lectura)'
            : `Clientes de ${selectedWarehouse?.nombre || 'la bodega activa'}`
        }
      />

      {isCentral && (
        <PageAlert tone="warning">
          En Central ves el consolidado. Para registrar clientes, selecciona una sucursal operativa.
        </PageAlert>
      )}

      {!isCentral && (
        <PageCard title="Nuevo cliente">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <PageInput name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre *" required />
            <PageInput name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <PageInput name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
            <PageInput name="nit" value={form.nit} onChange={handleChange} placeholder="NIT" />
            <div className="md:col-span-2">
              <PageButton type="submit">Agregar cliente</PageButton>
            </div>
          </form>
        </PageCard>
      )}

      {message && <PageMessage tone="success">{message}</PageMessage>}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {loading && <PageLoading message="Cargando clientes..." />}
      {!loading && !error && customers.length === 0 && (
        <PageEmpty
          message={
            isCentral
              ? 'No hay clientes registrados en las sucursales.'
              : 'Esta sucursal aún no tiene clientes.'
          }
        />
      )}

      {customers.length > 0 && (
        <PageTable>
          <PageTableHead>
            <tr>
              <PageTableHeaderCell>Nombre</PageTableHeaderCell>
              <PageTableHeaderCell>Email</PageTableHeaderCell>
              <PageTableHeaderCell>Teléfono</PageTableHeaderCell>
              <PageTableHeaderCell>NIT</PageTableHeaderCell>
            </tr>
          </PageTableHead>
          <tbody>
            {customers.map((customer) => (
              <PageTableRow key={customer._id}>
                <PageTableCell>{customer.nombre}</PageTableCell>
                <PageTableCell>{customer.email || '—'}</PageTableCell>
                <PageTableCell>{customer.telefono || '—'}</PageTableCell>
                <PageTableCell>{customer.nit || '—'}</PageTableCell>
              </PageTableRow>
            ))}
          </tbody>
        </PageTable>
      )}
    </PageShell>
  );
}
