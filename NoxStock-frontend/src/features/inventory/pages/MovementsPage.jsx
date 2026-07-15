import { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import useAuthStore from '../../../shared/stores/useAuthStore';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageSelect,
  PageLabel,
  PageButton,
  PageAlert,
  PageMessage,
  PageEmpty,
  StatusBadge,
} from '../../../shared/components/ui';
import { palette } from '../../../shared/theme/noxTheme';

function MovementPanel({ title, count, tone, items, emptyMessage, sign }) {
  const headerBg = tone === 'entry' ? palette.navy : palette.surfaceElevated;

  return (
    <PageCard className="overflow-hidden p-0">
      <div className="flex items-center gap-2 px-5 py-4" style={{ background: headerBg }}>
        <h2 className="text-lg font-semibold" style={{ color: palette.textPrimary }}>{title}</h2>
        <StatusBadge tone={tone === 'entry' ? 'navy' : 'neutral'}>{count}</StatusBadge>
      </div>
      <div className="space-y-3 p-4">
        {items.length === 0 ? (
          <PageEmpty message={emptyMessage} />
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border p-3"
              style={{
                borderColor: palette.border,
                background: palette.surfaceAlt,
                borderLeft: `4px solid ${tone === 'entry' ? palette.success : palette.danger}`,
              }}
            >
              <p className="font-semibold">{item.productId?.nombre || 'Producto'}</p>
              <p className="mt-1 text-sm" style={{ color: tone === 'entry' ? palette.successText : palette.dangerText }}>
                {sign}{item.cantidad} unidades
              </p>
              {item.motivo && <p className="mt-1 text-xs" style={{ color: palette.textSecondary }}>{item.motivo}</p>}
              {item.registradoPor && <p className="mt-1 text-xs" style={{ color: palette.textMuted }}>Por: {item.registradoPor}</p>}
              <p className="mt-2 text-xs" style={{ color: palette.textMuted }}>
                {item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : 'Sin fecha'}
              </p>
            </div>
          ))
        )}
      </div>
    </PageCard>
  );
}

export default function MovementsPage() {
  const { products, entries, outputs, loadMovements, loadProducts, inventoryService } = useInventory();
  const { selectedWarehouse, selectedWarehouseId, version, isCentral } = useWarehouse();
  const user = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'entry', productId: '', cantidad: '', motivo: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMovements();
  }, [loadMovements, version]);

  useEffect(() => {
    setForm({ type: 'entry', productId: '', cantidad: '', motivo: '' });
    setMessage('');
  }, [selectedWarehouseId, version]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.productId) {
      setMessage('Seleccione un producto');
      return;
    }

    const cantidad = Number(form.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMessage('Ingrese una cantidad válida mayor a 0');
      return;
    }

    const payload = { productId: form.productId, cantidad, motivo: form.motivo };

    try {
      setSubmitting(true);
      if (form.type === 'entry') {
        await inventoryService.registerEntry(payload);
      } else {
        await inventoryService.registerOutput(payload);
      }
      setMessage('Movimiento registrado correctamente');
      setForm((prev) => ({ ...prev, cantidad: '', motivo: '' }));
      await Promise.all([loadMovements(), loadProducts()]);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Error al registrar movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Movimientos de inventario"
        subtitle={
          isCentral
            ? 'Historial consolidado de todas las sucursales (solo lectura)'
            : `Entradas y salidas en ${selectedWarehouse?.nombre || 'la bodega activa'}`
        }
      />
      {user && (
        <p className="text-xs uppercase tracking-[0.16em]" style={{ color: palette.textMuted }}>
          Usuario: {user.nombre || user.email}
        </p>
      )}

      {!isCentral && (
        <PageCard title="Registrar movimiento">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <PageLabel className="mb-2 block">Tipo</PageLabel>
                <PageSelect name="type" value={form.type} onChange={handleChange}>
                  <option value="entry">Entrada</option>
                  <option value="output">Salida</option>
                </PageSelect>
              </div>
              <div>
                <PageLabel className="mb-2 block">Producto</PageLabel>
                <PageSelect name="productId" value={form.productId} onChange={handleChange} required>
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.nombre} (Stock: {product.existencia})
                    </option>
                  ))}
                </PageSelect>
              </div>
              <div>
                <PageLabel className="mb-2 block">Cantidad</PageLabel>
                <PageInput name="cantidad" type="number" value={form.cantidad} onChange={handleChange} placeholder="0" required />
              </div>
              <div>
                <PageLabel className="mb-2 block">Motivo</PageLabel>
                <PageInput name="motivo" value={form.motivo} onChange={handleChange} placeholder="Compra, devolución, ajuste..." />
              </div>
            </div>

            {message && (
              <PageMessage tone={message.includes('correctamente') ? 'success' : 'danger'}>{message}</PageMessage>
            )}

            <PageButton type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? 'Procesando...' : 'Registrar movimiento'}
            </PageButton>
          </form>
        </PageCard>
      )}

      {isCentral && (
        <PageAlert tone="warning">
          Para registrar movimientos, seleccione una sucursal operativa (no Central).
        </PageAlert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <MovementPanel title="Entradas" count={entries.length} tone="entry" items={entries} emptyMessage="No hay entradas registradas" sign="+" />
        <MovementPanel title="Salidas" count={outputs.length} tone="output" items={outputs} emptyMessage="No hay salidas registradas" sign="-" />
      </div>
    </PageShell>
  );
}
