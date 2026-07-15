import { createHttpClient } from './createHttpClient';

const reportsClient = createHttpClient(
  import.meta.env.VITE_REPORTS_SERVICE_URL || 'http://localhost:3003'
);

export default reportsClient;
