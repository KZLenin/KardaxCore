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

  actualizarEquipo: async (id, datosActualizados) => {
    try {
      const response = await httpClient.put(`/inventory/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al actualizar el equipo';
    }
  },

  getHistorial: async (id) => {
    try {
      const response = await httpClient.get(`/inventory/${id}/historial`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar el historial del equipo';
    }
  },
  
  descargarEtiquetasPDF: async (id, cantidad = 1) => {
    try {
      // Le decimos a Axios: "Prepárate, lo que viene es un archivo (blob), no un JSON"
      const response = await httpClient.get(`/inventory/${id}/etiquetas?cantidad=${cantidad}`, {
        responseType: 'blob' 
      });
      return response.data; // Retorna el archivo crudo
    } catch (error) {
      throw new Error('Error al generar el PDF de etiquetas');
    }
  },

};