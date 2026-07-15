import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageButton,
  PageLinkButton,
  PageTable,
  PageTableHead,
  PageTableRow,
  PageTableCell,
  PageTableHeaderCell,
  StatusBadge,
  PageLoading,
  PageEmpty,
  PageMessage,
} from '../../../shared/components/ui';
import { palette } from '../../../shared/theme/noxTheme';

export default function ProductsPage() {
  const { products, loading, error, loadProducts } = useInventory();
  const { selectedWarehouse, isCentral } = useWarehouse();
  const [showLowStock, setShowLowStock] = useState(false);

  const handleFilter = () => {
    loadProducts(showLowStock ? { bajoStock: 'true' } : {});
  };

  const isLowStock = (product) => {
    const min = product.stockMinimo ?? 5;
    return product.existencia > 0 && product.existencia <= min;
  };

  return (
    <PageShell>
      <PageHeader
        title="Inventario — Productos"
        subtitle={
          isCentral
            ? 'Vista consolidada — stock total de todas las sucursales'
            : `Stock en ${selectedWarehouse?.nombre || 'la bodega activa'}`
        }
        actions={!isCentral && <PageLinkButton to="/loby/inventory/new">Nuevo producto</PageLinkButton>}
      />

      {isCentral && (
        <PageMessage tone="warning">
          Central es solo lectura. Selecciona una sucursal operativa para crear o editar productos.
        </PageMessage>
      )}

      <PageCard>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm" style={{ color: palette.textSecondary }}>
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            Solo bajo stock
          </label>
          <PageButton variant="secondary" onClick={handleFilter}>
            Aplicar filtro
          </PageButton>
          <PageButton
            variant="ghost"
            onClick={() => {
              setShowLowStock(false);
              loadProducts();
            }}
          >
            Ver todos
          </PageButton>
        </div>
      </PageCard>

      {loading && <PageLoading message="Cargando productos..." />}
      {error && <PageMessage tone="danger">{error}</PageMessage>}
      {!loading && !error && products.length === 0 && (
        <PageEmpty message="Esta bodega aún no tiene productos. Crea el primero con «Nuevo producto»." />
      )}

      {!loading && products.length > 0 && (
        <PageTable>
          <PageTableHead>
            <tr>
              <PageTableHeaderCell>Nombre</PageTableHeaderCell>
              <PageTableHeaderCell>Categoría</PageTableHeaderCell>
              <PageTableHeaderCell align="right">Precio</PageTableHeaderCell>
              <PageTableHeaderCell align="right">Existencia</PageTableHeaderCell>
              <PageTableHeaderCell align="right">Stock mín.</PageTableHeaderCell>
              <PageTableHeaderCell align="center">Estado</PageTableHeaderCell>
              <PageTableHeaderCell align="center">Acciones</PageTableHeaderCell>
            </tr>
          </PageTableHead>
          <tbody>
            {products.map((product) => (
              <PageTableRow key={product._id}>
                <PageTableCell>{product.nombre}</PageTableCell>
                <PageTableCell>{product.categoria}</PageTableCell>
                <PageTableCell align="right">Q{product.precio}</PageTableCell>
                <PageTableCell align="right">{product.existencia}</PageTableCell>
                <PageTableCell align="right">{product.stockMinimo ?? 5}</PageTableCell>
                <PageTableCell align="center">
                  {isLowStock(product) ? (
                    <StatusBadge tone="warning">Bajo stock</StatusBadge>
                  ) : product.existencia === 0 ? (
                    <StatusBadge tone="danger">Agotado</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">OK</StatusBadge>
                  )}
                </PageTableCell>
                <PageTableCell align="center">
                  <Link to={`/loby/inventory/${product._id}/edit`} style={{ color: palette.navyLight }}>
                    Editar
                  </Link>
                </PageTableCell>
              </PageTableRow>
            ))}
          </tbody>
        </PageTable>
      )}
    </PageShell>
  );
}
