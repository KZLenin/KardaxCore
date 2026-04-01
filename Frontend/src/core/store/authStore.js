import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Acción para iniciar sesión
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('kardax_token', token); // Sincronizamos con tu httpClient
      },

      // Acción para cerrar sesión
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('kardax_token');
        localStorage.removeItem('kardax_user');
      },
    }),
    {
      name: 'kardax-auth-storage', // Nombre de la llave en LocalStorage
    }
  )
);