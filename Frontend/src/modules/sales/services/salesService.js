import httpClient from '@/core/api/httpClient'; // O la ruta que uses para tu Axios instanciado

export const salesService = {
  registrarVenta: async (datosVenta) => {
    try {
      const response = await httpClient.post('/ventas/registrar', datosVenta);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al procesar la venta');
    }
  },
  getHistorialVentas: async (filtros = {}) => {
    try {
      // Pasamos los filtros como query params (ej. ?buscar=SmartFit)
      const response = await httpClient.get('/ventas/historial', { params: filtros });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cargar el historial de ventas');
    }
  },

  getVentaDetalle: async (id) => {
    const response = await httpClient.get(`/ventas/${id}`);
    return response.data;
  },

  descargarPDF: async (id) => {
    try {
      // Pedimos el archivo como 'blob' (binario)
      const response = await httpClient.get(`/ventas/${id}/pdf`, { 
        responseType: 'blob' 
      });
      
      // SOLO retornamos el archivo crudo. El componente (SalesHistoryTable) se encarga de abrirlo.
      return response.data; 
    } catch (error) {
      throw new Error('Error al generar el PDF de la venta');
    }
  }
};