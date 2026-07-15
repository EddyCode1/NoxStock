import inventoryClient from '../inventoryClient';

const unwrap = (response) => response.data?.data ?? response.data;

/**
 * Servicio para consumir el endpoint de estadísticas del dashboard
 * expuesto por inventory-service (GET /statistics?warehouseId=...).
 */
export const statisticsService = {
  getStatistics: async (warehouseId) => {
    if (!warehouseId) {
      throw new Error('warehouseId es obligatorio para cargar estadísticas');
    }

    const response = await inventoryClient.get('/statistics', {
      params: { warehouseId },
    });

    return unwrap(response);
  },
};

export default statisticsService;
