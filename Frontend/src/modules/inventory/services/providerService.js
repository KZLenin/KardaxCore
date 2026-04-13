import httpClient from '@/core/api/httpClient';

export const providerService = {
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

  registrarProveedor: async (datosProveedor) => {
    try {
      const response = await httpClient.post('/inventory/proveedores', datosProveedor);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al registrar el proveedor';
    }
  },

  actualizarProveedor: async (id, datos) => {
  const response = await httpClient.put(`/inventory/proveedores/${id}`, datos);
  return response.data;
}
}