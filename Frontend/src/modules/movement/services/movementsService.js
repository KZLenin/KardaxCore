import httpClient from '@/core/api/httpClient';

export const movementsService = {
  // Busca el equipo apenas el láser dispara
  buscarPorCodigo: async (codigo) => {
    try {
      const response = await httpClient.get(`/movements/search/${codigo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Código no encontrado en inventario';
    }
  },
  // Registra el movimiento final (Salida o Ingreso)
  registrar: async (datos) => {
    try {
      const response = await httpClient.post('/movements/registrar', datos);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al procesar el movimiento logístico';
    }
  },

  // Trae la data para la tabla de historial
  getAll: async () => {
    try {
      const response = await httpClient.get('/movements');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al obtener el historial';
    }
  }
};