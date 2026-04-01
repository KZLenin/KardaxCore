import httpClient from '@/core/api/httpClient';

export const inventoryService = {
  /**
   * Obtiene el inventario aplicando los filtros (búsqueda, categoría, proveedor, sede)
   */
  getAll: async (filtros = {}) => {
    try {
      // Axios convierte el objeto { categoriaId: 1 } en '?categoriaId=1' automáticamente
      const response = await httpClient.get('/inventory', { params: filtros }); 
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar el inventario';
    }
  },

  /**
   * Obtiene la lista de categorías para el selector
   */
  getCategorias: async () => {
    try {
      const response = await httpClient.get('/inventory/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar categorías';
    }
  },

  /**
   * Obtiene la lista de proveedores para el selector
   */
  getProveedores: async () => {
    try {
      const response = await httpClient.get('/inventory/proveedores');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar proveedores';
    }
  },

  registrarEntrada: async (datosItem) => {
    try {
      const response = await httpClient.post('/inventory/entrada', datosItem);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al registrar el equipo';
    }
  },

};