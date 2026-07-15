import apiClient from './apiClient';

export const authApi = {
  register: (datos) => apiClient.post('/auth/register', datos),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
};

export default authApi;
