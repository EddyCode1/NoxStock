import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import useWarehouseStore from '../../../shared/stores/useWarehouseStore';

export default function ProductsPage() {
  const { products, loading, error, loadProducts } = useInventory();
  const selectedWarehouse = useWarehouseStore((state) => state.getSelectedWarehouse());
  const [showLowStock, setShowLowStock] = useState(false);

  const handleFilter = () => {
    loadProducts(showLowStock ? { bajoStock: 'true' } : {});
  };

  const isLowStock = (product) => {
    const min = product.stockMinimo ?? 5;
    return product.existencia > 0 && product.existencia <= min;
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario - Productos</h1>
          <p className="text-sm text-gray-500">
            Stock en {selectedWarehouse?.nombre || 'la bodega activa'}
          </p>
        </div>
        <Link to="/loby/inventory/new" className="rounded bg-black px-4 py-2 text-white">
          Nuevo producto
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          Solo bajo stock
        </label>
        <button type="button" onClick={handleFilter} className="rounded border px-3 py-1">
          Aplicar filtro
        </button>
        <button type="button" onClick={() => { setShowLowStock(false); loadProducts(); }} className="rounded border px-3 py-1">
          Ver todos
        </button>
      </div>

      {loading && <p>Cargando productos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Categoría</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Existencia</th>
              <th className="px-3 py-2 text-right">Stock mín.</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t">
                <td className="px-3 py-2">{product.nombre}</td>
                <td className="px-3 py-2">{product.categoria}</td>
                <td className="px-3 py-2 text-right">Q{product.precio}</td>
                <td className="px-3 py-2 text-right">{product.existencia}</td>
                <td className="px-3 py-2 text-right">{product.stockMinimo ?? 5}</td>
                <td className="px-3 py-2 text-center">
                  {isLowStock(product) ? (
                    <span className="text-amber-700">Bajo stock</span>
                  ) : product.existencia === 0 ? (
                    <span className="text-red-600">Agotado</span>
                  ) : (
                    <span className="text-green-700">OK</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <Link to={`/loby/inventory/${product._id}/edit`} className="underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
