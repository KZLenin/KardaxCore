import httpClient from '@/core/api/httpClient';

export const movementsService = {
  buscarPorCodigo: async (codigo) => {
    try {
      const response = await httpClient.get(`/movements/search/${codigo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Código no encontrado en inventario';
    }
  },
  
  registrar: async (datos) => {
    try {
      // datos ahora incluye: itemId, tipoMovimiento, cantidad, motivo, destinoNombre
      const response = await httpClient.post('/movements/registrar', datos);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al procesar el movimiento logístico';
    }
  },

  getAll: async () => {
    try {
      const response = await httpClient.get('/movements');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al obtener el historial';
    }
  },


  darDeBajaEquipo: async (itemId, datosBaja, archivoEvidencia) => {
    try {
      const formData = new FormData();
      formData.append('motivo', datosBaja.motivo);
      formData.append('cantidadActual', datosBaja.cantidadActual);
      
      if (archivoEvidencia) {
        formData.append('evidencia', archivoEvidencia);
      }

      // 🔥 FIX DEFINITIVO: Obligamos a httpClient a soltar el JSON
      const response = await httpClient.post(`/movements/${itemId}/baja`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al dar de baja el equipo';
    }
  }
};