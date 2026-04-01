import httpClient from '@/core/api/httpClient';

export const maintenanceService = {
  /**
   * Crea una nueva orden de trabajo y bloquea el equipo
   */
  crearOrden: async (datosOrden) => {
    try {
      const response = await httpClient.post('/maintenance/ordenes', datosOrden);
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

  // Aquí iremos agregando listarOrdenes, actualizarOrden, etc. en el futuro
};