import { useEffect, useState } from 'react';
import noxReportsService from '../../../shared/api/services/noxReportsService';
import { useWarehouse } from '../../../shared/hooks/useWarehouse';
import {
  PageShell,
  PageHeader,
  PageCard,
  PageInput,
  PageLabel,
  PageButton,
  PageTable,
  PageTableHead,
  PageTableRow,
  PageTableCell,
  PageTableHeaderCell,
  PageMessage,
  PageLoading,
} from '../../../shared/components/ui';

export default function InventoryInsightsPage() {
  const [days, setDays] = useState(30);
  const [rotation, setRotation] = useState([]);
  const [noMovement, setNoMovement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { selectedWarehouseId, selectedWarehouse, version, isReady } = useWarehouse();

  const loadReports = async (period = days) => {
    if (!isReady || !selectedWarehouseId) return;
    setLoading(true);
    setError('');
    try {
      const [rotationData, noMovementData] = await Promise.all([
        noxReportsService.getRotationReport({ days: period }),
        noxReportsService.getNoMovementReport({ days: period }),
      ]);
      setRotation(rotationData.data || []);
      setNoMovement(noMovementData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar análisis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRotation([]);
    setNoMovement([]);
    setError('');
  }, [selectedWarehouseId, version]);

  useEffect(() => {
    loadReports(days);
  }, [isReady, selectedWarehouseId, version]);

  const handleApply = (event) => {
    event.preventDefault();
    loadReports(Number(days));
  };

  return (
    <PageShell>
      <PageHeader
        title="Análisis de inventario"
        subtitle={`Rotación y sin movimiento en ${selectedWarehouse?.nombre || 'la bodega activa'}`}
      />

      <PageCard>
        <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">
          <div>
            <PageLabel className="mb-2 block">Días a analizar</PageLabel>
            <PageInput type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className="w-32" />
          </div>
          <PageButton type="submit">Actualizar</PageButton>
        </form>
      </PageCard>

      {loading && <PageLoading />}
      {error && <PageMessage tone="danger">{error}</PageMessage>}

      <div className="grid gap-6 lg:grid-cols-2">
        <PageCard title={`Rotación (${rotation.length})`}>
          <PageTable>
            <PageTableHead>
              <tr>
                <PageTableHeaderCell>Producto</PageTableHeaderCell>
                <PageTableHeaderCell align="right">Entradas</PageTableHeaderCell>
                <PageTableHeaderCell align="right">Salidas</PageTableHeaderCell>
                <PageTableHeaderCell align="right">Total</PageTableHeaderCell>
              </tr>
            </PageTableHead>
            <tbody>
              {rotation.map((item) => (
                <PageTableRow key={item.productId}>
                  <PageTableCell>{item.productName}</PageTableCell>
                  <PageTableCell align="right">{item.entriesQty}</PageTableCell>
                  <PageTableCell align="right">{item.outputsQty}</PageTableCell>
                  <PageTableCell align="right">{item.totalMovement}</PageTableCell>
                </PageTableRow>
              ))}
            </tbody>
          </PageTable>
        </PageCard>

        <PageCard title={`Sin movimiento (${noMovement.length})`}>
          <PageTable>
            <PageTableHead>
              <tr>
                <PageTableHeaderCell>Producto</PageTableHeaderCell>
                <PageTableHeaderCell align="right">Stock</PageTableHeaderCell>
                <PageTableHeaderCell align="right">Días sin salida</PageTableHeaderCell>
              </tr>
            </PageTableHead>
            <tbody>
              {noMovement.map((item) => (
                <PageTableRow key={item.productId}>
                  <PageTableCell>{item.productName}</PageTableCell>
                  <PageTableCell align="right">{item.currentStock}</PageTableCell>
                  <PageTableCell align="right">{item.daysSinceLastOutput ?? 'Nunca'}</PageTableCell>
                </PageTableRow>
              ))}
            </tbody>
          </PageTable>
        </PageCard>
      </div>
    </PageShell>
  );
}
