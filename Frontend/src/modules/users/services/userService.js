import httpClient from '@/core/api/httpClient';

export const userService = {
  getRoles: async () => {
    const response = await httpClient.get('/users/roles');
    return response.data;
  },
  
  getUsuarios: async () => {
    const response = await httpClient.get('/users');
    return response.data;
  },

  registrarUsuario: async (datos) => {
    const response = await httpClient.post('/users', datos);
    return response.data;
  },

  actualizarUsuario: async (id, datos) => {
    const response = await httpClient.put(`/users/${id}`, datos);
    return response.data;
  }
};