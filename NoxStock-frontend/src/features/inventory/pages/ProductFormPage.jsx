import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import inventoryService from '../../../shared/api/services/inventoryService';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';

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
  const selectedWarehouseId = useWarehouseStore((state) => state.selectedWarehouseId);
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());

  useEffect(() => {
    if (!isEdit || !selectedWarehouseId) return;

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
  }, [id, isEdit, selectedWarehouseId]);

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
    <section className="max-w-xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
        <p className="text-sm text-gray-500">
          Stock en {selectedWarehouse?.nombre || 'la bodega activa'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 rounded border p-4">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="w-full rounded border px-3 py-2" required />
        <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoría" className="w-full rounded border px-3 py-2" required />
        <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" className="w-full rounded border px-3 py-2" required />
        <input name="stockMinimo" type="number" value={form.stockMinimo} onChange={handleChange} placeholder="Stock mínimo" className="w-full rounded border px-3 py-2" min="0" />
        {!isEdit && (
          <input name="existencia" type="number" value={form.existencia} onChange={handleChange} placeholder="Existencia inicial" className="w-full rounded border px-3 py-2" />
        )}

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded bg-black px-4 py-2 text-white">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/loby/inventory" className="rounded border px-4 py-2">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
