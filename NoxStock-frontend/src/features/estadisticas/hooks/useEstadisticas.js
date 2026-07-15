import { useCallback, useEffect, useState } from 'react';
import statisticsService from '../../../shared/api/services/statisticsService';

/**
 * Hook para consumir y manejar el estado de las estadísticas del dashboard.
 * Se conecta al endpoint GET /statistics de inventory-service.
 */
export function useEstadisticas() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatistics = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

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
  }, [loadStatistics]);

  return {
    data,
    loading,
    error,
    reload: loadStatistics,
  };
}

export default useEstadisticas;
