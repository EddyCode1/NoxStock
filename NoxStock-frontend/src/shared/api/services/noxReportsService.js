import reportsClient from '../reportsClient';

const unwrap = (response) => response.data?.data ?? response.data;

export const noxReportsService = {
  getLowStockAlerts: async (params = {}) => {
    const response = await reportsClient.get('/alerts/low-stock', { params });
    return response.data;
  },

  getOutOfStockAlerts: async () => {
    const response = await reportsClient.get('/alerts/out-of-stock');
    return response.data;
  },

  getTopProducts: async () => {
    const response = await reportsClient.get('/reports/top-products');
    return response.data;
  },

  getCategoriesReport: async () => {
    const response = await reportsClient.get('/reports/categories');
    return response.data;
  },

  getSummary: async () => {
    const response = await reportsClient.get('/reports/summary');
    return response.data;
  },

  getRotationReport: async (params = {}) => {
    const response = await reportsClient.get('/reports/rotation', { params });
    return response.data;
  },

  getNoMovementReport: async (params = {}) => {
    const response = await reportsClient.get('/reports/no-movement', { params });
    return response.data;
  },
};

export default noxReportsService;
