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
};

export default inventoryService;
