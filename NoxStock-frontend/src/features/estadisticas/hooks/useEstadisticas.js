import { useCallback, useEffect, useState } from 'react';
import statisticsService from '../../../shared/api/services/statisticsService';
import useWarehouse from '../../../shared/hooks/useWarehouse';

/**
 * Hook para consumir y manejar el estado de las estadísticas del dashboard.
 * Se conecta al endpoint GET /statistics de inventory-service
 * y recarga automáticamente al cambiar de sucursal.
 */
export function useEstadisticas() {
  const { selectedWarehouseId, selectedWarehouse, isCentral, isReady, version } = useWarehouse();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatistics = useCallback(async () => {
    if (!selectedWarehouseId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await statisticsService.getStatistics();
      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'No se pudieron cargar las estadísticas del dashboard'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (!isReady || !selectedWarehouseId) {
      setLoading(!isReady);
      return undefined;
    }

    let isMounted = true;
    setData(null);
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await statisticsService.getStatistics();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'No se pudieron cargar las estadísticas del dashboard'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedWarehouseId, version, isReady]);

  return {
    data,
    loading,
    error,
    reload: loadStatistics,
    selectedWarehouse,
    isCentral,
    warehouseId: selectedWarehouseId,
  };
}

export default useEstadisticas;
