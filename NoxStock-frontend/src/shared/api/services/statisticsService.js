import inventoryClient from '../inventoryClient';

const unwrap = (response) => response.data?.data ?? response.data;

/**
 * Servicio para consumir el endpoint de estadísticas del dashboard
 * expuesto por inventory-service (GET /statistics).
 */
export const statisticsService = {
  getStatistics: async () => {
    const response = await inventoryClient.get('/statistics');
    return unwrap(response);
  },
};

export default statisticsService;
