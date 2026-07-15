import { createHttpClient } from './createHttpClient';
import { attachInventoryWarehouse } from './warehouseHttp';

const inventoryClient = createHttpClient(
  import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:3002'
);

inventoryClient.interceptors.request.use((config) => attachInventoryWarehouse(config));

export default inventoryClient;
