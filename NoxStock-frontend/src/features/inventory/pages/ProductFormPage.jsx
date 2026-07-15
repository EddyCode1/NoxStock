import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageButton,
  PageLinkButton,
  PageMessage,
} from '../../../shared/components/ui';

const emptyForm = {
  nombre: '',
  categoria: '',
  precio: '',
  existencia: '',
  stockMinimo: '5',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedWarehouseId, selectedWarehouse, version, isReady } = useWarehouse();

  useEffect(() => {
    if (!isEdit || !isReady || !selectedWarehouseId) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.getProductById(id);
        const product = data.product;
        setForm({
          nombre: product.nombre,
          categoria: product.categoria,
          precio: String(product.precio),
          existencia: String(product.existencia),
          stockMinimo: String(product.stockMinimo ?? 5),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEdit, isReady, selectedWarehouseId, version]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      precio: Number(form.precio),
      stockMinimo: Number(form.stockMinimo || 5),
    };

    if (!isEdit) {
      payload.existencia = Number(form.existencia || 0);
    }

    try {
      if (isEdit) {
        await inventoryService.updateProduct(id, payload);
      } else {
        await inventoryService.createProduct(payload);
      }

      navigate('/loby/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="max-w-xl">
      <PageHeader
        title={isEdit ? 'Editar producto' : 'Nuevo producto'}
        subtitle={`Stock en ${selectedWarehouse?.nombre || 'la bodega activa'}`}
      />

      <PageCard>
        <form onSubmit={handleSubmit} className="space-y-3">
          <PageInput name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
          <PageInput name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoría" required />
          <PageInput name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" required />
          <PageInput name="stockMinimo" type="number" value={form.stockMinimo} onChange={handleChange} placeholder="Stock mínimo" min="0" />
          {!isEdit && (
            <PageInput name="existencia" type="number" value={form.existencia} onChange={handleChange} placeholder="Existencia inicial" />
          )}

          {error && <PageMessage tone="danger">{error}</PageMessage>}

          <div className="flex flex-wrap gap-2 pt-2">
            <PageButton type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </PageButton>
            <PageLinkButton to="/loby/inventory" variant="secondary">
              Cancelar
            </PageLinkButton>
          </div>
        </form>
      </PageCard>
    </PageShell>
  );
}
