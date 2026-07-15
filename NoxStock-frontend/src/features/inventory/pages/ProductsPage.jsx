import { Link } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';

export default function ProductsPage() {
  const { products, loading, error, loadProducts } = useInventory();

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario - Productos</h1>
          <p className="text-sm text-gray-500">Estructura base conectada a inventory-service</p>
        </div>
        <Link to="/loby/inventory/new" className="rounded bg-black px-4 py-2 text-white">
          Nuevo producto
        </Link>
      </header>

      <div className="flex gap-2">
        <button type="button" onClick={() => loadProducts()} className="rounded border px-3 py-1">
          Recargar
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
