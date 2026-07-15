import { createHttpClient } from './createHttpClient';
import { attachReportsWarehouse } from './warehouseHttp';

const reportsClient = createHttpClient(
  import.meta.env.VITE_REPORTS_SERVICE_URL || 'http://localhost:3003'
);

reportsClient.interceptors.request.use((config) => attachReportsWarehouse(config));

export default reportsClient;
