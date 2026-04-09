import httpClient from '@/core/api/httpClient';

export const maintenanceService = {
  /**
   * Crea una nueva orden de trabajo y bloquea el equipo
   */
  crearOrden: async (formData) => {
    try {
      const response = await httpClient.post('/maintenance/ordenes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // 🔥 ESTO EVITA QUE LA FOTO SE CONVIERTA EN {}
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al crear la orden de trabajo';
    }
  },
  
  getAll: async () => {
    try {
      const response = await httpClient.get('/maintenance/ordenes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar los tickets';
    }
  },

  actualizarOrden: async (id, datosActualizados) => {
    try {
      const response = await httpClient.put(`/maintenance/ordenes/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al actualizar la orden de trabajo';
    }
  },

  lookupEquipoPorScanner: async (codigo) => {
    try {
      const response = await httpClient.get(`/maintenance/scanner-lookup/${codigo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al buscar el equipo escaneado';
    }
  },
  // Aquí iremos agregando listarOrdenes, actualizarOrden, etc. en el futuro
};