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

const emptyForm = { nombre: '', contacto: '', email: '', telefono: '' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { selectedWarehouseId, selectedWarehouse, version, isReady, isCentral } = useWarehouse();

  const loadSuppliers = useCallback(async () => {
    if (!isReady || !selectedWarehouseId) return;
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
  }, [isReady, selectedWarehouseId, version]);

  useEffect(() => {
    setSuppliers([]);
    setForm(emptyForm);
    setMessage('');
    setError('');
  }, [selectedWarehouseId, version]);

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
    <PageShell>
      <PageHeader
        title="Proveedores"
        subtitle={
          isCentral
            ? 'Proveedores de todas las sucursales (solo lectura)'
            : `Proveedores de ${selectedWarehouse?.nombre || 'la bodega activa'}`
        }
      />

      {isCentral && (
        <PageAlert tone="warning">
          En Central ves el consolidado. Para registrar proveedores, selecciona una sucursal operativa.
        </PageAlert>
      )}

      {!isCentral && (
        <PageCard title="Nuevo proveedor">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <PageInput name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre *" required />
            <PageInput name="contacto" value={form.contacto} onChange={handleChange} placeholder="Contacto" />
            <PageInput name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <PageInput name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
            <div className="md:col-span-2">
              <PageButton type="submit">Agregar proveedor</PageButton>
            </div>
          </form>
        </PageCard>
      )}

      {message && <PageMessage tone="success">{message}</PageMessage>}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {loading && <PageLoading message="Cargando proveedores..." />}
      {!loading && !error && suppliers.length === 0 && (
        <PageEmpty
          message={
            isCentral
              ? 'No hay proveedores registrados en las sucursales.'
              : 'Esta sucursal aún no tiene proveedores.'
          }
        />
      )}

      {suppliers.length > 0 && (
        <PageTable>
          <PageTableHead>
            <tr>
              <PageTableHeaderCell>Nombre</PageTableHeaderCell>
              <PageTableHeaderCell>Contacto</PageTableHeaderCell>
              <PageTableHeaderCell>Email</PageTableHeaderCell>
              <PageTableHeaderCell>Teléfono</PageTableHeaderCell>
            </tr>
          </PageTableHead>
          <tbody>
            {suppliers.map((supplier) => (
              <PageTableRow key={supplier._id}>
                <PageTableCell>{supplier.nombre}</PageTableCell>
                <PageTableCell>{supplier.contacto || '—'}</PageTableCell>
                <PageTableCell>{supplier.email || '—'}</PageTableCell>
                <PageTableCell>{supplier.telefono || '—'}</PageTableCell>
              </PageTableRow>
            ))}
          </tbody>
        </PageTable>
      )}
    </PageShell>
  );
}
