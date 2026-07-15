import inventoryClient from '../inventoryClient';

const unwrap = (response) => response.data?.data ?? response.data;

export const inventoryService = {
  getProducts: async (params = {}) => {
    const response = await inventoryClient.get('/products', { params });
    return unwrap(response);
  },

  getProductById: async (id) => {
    const response = await inventoryClient.get(`/products/${id}`);
    return unwrap(response);
  },

  createProduct: async (payload) => {
    const response = await inventoryClient.post('/products', payload);
    return unwrap(response);
  },

  updateProduct: async (id, payload) => {
    const response = await inventoryClient.put(`/products/${id}`, payload);
    return unwrap(response);
  },

  deleteProduct: async (id) => {
    const response = await inventoryClient.delete(`/products/${id}`);
    return unwrap(response);
  },

  getCategories: async () => {
    const response = await inventoryClient.get('/categories');
    return unwrap(response);
  },

  getEntries: async (params = {}) => {
    const response = await inventoryClient.get('/entries', { params });
    return unwrap(response);
  },

  getOutputs: async (params = {}) => {
    const response = await inventoryClient.get('/outputs', { params });
    return unwrap(response);
  },

  registerEntry: async (payload) => {
    const response = await inventoryClient.post('/entries', payload);
    return unwrap(response);
  },

  registerOutput: async (payload) => {
    const response = await inventoryClient.post('/outputs', payload);
    return unwrap(response);
  },

  getSuppliers: async (params = {}) => {
    const response = await inventoryClient.get('/suppliers', { params });
    return unwrap(response);
  },

  createSupplier: async (payload) => {
    const response = await inventoryClient.post('/suppliers', payload);
    return unwrap(response);
  },

  getPurchaseOrders: async (params = {}) => {
    const response = await inventoryClient.get('/purchase-orders', { params });
    return unwrap(response);
  },

  createPurchaseOrder: async (payload) => {
    const response = await inventoryClient.post('/purchase-orders', payload);
    return unwrap(response);
  },

  sendPurchaseOrder: async (id) => {
    const response = await inventoryClient.post(`/purchase-orders/${id}/send`);
    return unwrap(response);
  },

  receivePurchaseOrder: async (id) => {
    const response = await inventoryClient.post(`/purchase-orders/${id}/receive`);
    return unwrap(response);
  },

  cancelPurchaseOrder: async (id) => {
    const response = await inventoryClient.post(`/purchase-orders/${id}/cancel`);
    return unwrap(response);
  },

  getCustomers: async (params = {}) => {
    const response = await inventoryClient.get('/customers', { params });
    return unwrap(response);
  },

  createCustomer: async (payload) => {
    const response = await inventoryClient.post('/customers', payload);
    return unwrap(response);
  },

  getSales: async (params = {}) => {
    const response = await inventoryClient.get('/sales', { params });
    return unwrap(response);
  },

  createSale: async (payload) => {
    const response = await inventoryClient.post('/sales', payload);
    return unwrap(response);
  },

  confirmSale: async (id) => {
    const response = await inventoryClient.post(`/sales/${id}/confirm`);
    return unwrap(response);
  },

  cancelSale: async (id) => {
    const response = await inventoryClient.post(`/sales/${id}/cancel`);
    return unwrap(response);
  },
};

export default inventoryService;
