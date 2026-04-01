import httpClient from '@/core/api/httpClient';

export const categoryService = {
  getCategorias: async () => {
    try {
      const response = await httpClient.get('/inventory/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar categorías';
    }
  },

  registrarCategoria: async (datosCategoria) => {
    try {
      const response = await httpClient.post('/inventory/categorias', datosCategoria);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al registrar la categoría';
    }
  },
}
