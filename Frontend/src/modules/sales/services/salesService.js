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
    // Pedimos el archivo como 'blob' (binario) para poder descargarlo
    const response = await httpClient.get(`/ventas/${id}/pdf`, { responseType: 'blob' });
    
    // Magia de React para forzar la descarga del PDF en el navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Comprobante_Venta_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};