import useWarehouseStore from '../stores/useWarehouseStore';

const INVENTORY_WAREHOUSE_PATHS = [
  /^\/products/,
  /^\/entries/,
  /^\/outputs/,
  /^\/purchase-orders/,
  /^\/sales/,
  /^\/categories/,
];

const REPORTS_WAREHOUSE_PATHS = [/^\/alerts/, /^\/reports/];

function pathNeedsWarehouse(url, patterns) {
  const path = (url || '').split('?')[0];
  return patterns.some((pattern) => pattern.test(path));
}

function attachWarehouseId(config, patterns) {
  const warehouseId = useWarehouseStore.getState().selectedWarehouseId;

  if (!warehouseId || !pathNeedsWarehouse(config.url, patterns)) {
    return config;
  }

  const method = (config.method || 'get').toLowerCase();

  if (['get', 'delete', 'head'].includes(method)) {
    config.params = { ...config.params, warehouseId };
    return config;
  }

  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    if (!config.data.warehouseId) {
      config.data = { ...config.data, warehouseId };
    }
  }

  return config;
}

export function attachInventoryWarehouse(config) {
  return attachWarehouseId(config, INVENTORY_WAREHOUSE_PATHS);
}

export function attachReportsWarehouse(config) {
  return attachWarehouseId(config, REPORTS_WAREHOUSE_PATHS);
}
