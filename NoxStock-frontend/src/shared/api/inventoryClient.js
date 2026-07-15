import { createHttpClient } from './createHttpClient';

const inventoryClient = createHttpClient(
  import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:3002'
);

export default inventoryClient;
