import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authApi from '../api/authApi';

const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Registro
      register: async (datos) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(datos);
          const { token, usuario } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          
          set({
            usuario,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error en el registro';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { token, usuario } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          
          set({
            usuario,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error en el login';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        set({
          usuario: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Restaurar sesión desde localStorage
      restoreSession: () => {
        const token = localStorage.getItem('token');
        const usuarioStr = localStorage.getItem('usuario');
        
        if (token && usuarioStr) {
          try {
            const usuario = JSON.parse(usuarioStr);
            set({
              usuario,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Error restaurando sesión:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
          }
        }
      },

      // Limpiar error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
