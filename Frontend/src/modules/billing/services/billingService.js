import httpClient from '@/core/api/httpClient'; // Ajusta a tu configuración de Axios


export const billingService = {
  // Obtener ventas listas para facturar
  getPendientes: async () => {
    const response = await httpClient.get('/billing/pendientes');
    return response.data;
  },

  // Enviar las órdenes agrupadas para crear la factura
  generarFactura: async (payload) => {
    const response = await httpClient.post('/billing/generar', payload);
    return response.data;
  },

  // Obtener cartera (Cuentas por cobrar)
  getCartera: async () => {
    const response = await httpClient.get('/billing/cartera');
    return response.data;
  },

  // Registrar un abono o pago completo
  registrarAbono: async (facturaId, payload) => {
    const response = await httpClient.post(`/billing/${facturaId}/pagar`, payload);
    return response.data;
  }
};