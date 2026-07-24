import httpClient from '@/core/api/httpClient';

export const quotesService = {
  generarCotizacion: async (datos) => {
    try {
      const response = await httpClient.post('/quotes/importar', datos);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al generar la cotización');
    }
  },

  listarCotizaciones: async (filtros = {}) => {
    try {
      const response = await httpClient.get('/quotes', { params: filtros });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cargar cotizaciones');
    }
  },

  obtenerDetalle: async (id) => {
    try {
      const response = await httpClient.get(`/quotes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener el detalle');
    }
  },

  actualizarCotizacion: async (id, datos) => {
    try {
      const response = await httpClient.put(`/quotes/${id}`, datos);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar');
    }
  },

  aprobarCotizacion: async (id, detallesAceptados) => {
    try {
      const response = await httpClient.post(`/quotes/${id}/aprobar`, { detalles_aceptados: detallesAceptados });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al procesar la aprobación');
    }
  },

  descargarPDF: async (id) => {
    try {
      const response = await httpClient.get(`/quotes/${id}/pdf`, { 
        responseType: 'blob' 
      });
      return response.data; 
    } catch (error) {
      throw new Error('Error al generar la Proforma en PDF');
    }
  }
};