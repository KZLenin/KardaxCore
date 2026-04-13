import httpClient from '@/core/api/httpClient'; // Ajusta a tu configuración de Axios

export const clientService = {
  // ==========================================
  // EMPRESAS
  // ==========================================
  obtenerEmpresas: async () => {
    const response = await httpClient.get('/clientes');
    return response.data;
  },
  
  crearEmpresa: async (datos) => {
    const response = await httpClient.post('/clientes', datos);
    return response.data;
  },

  actualizarEmpresa: async (id, datos) => {
    const response = await httpClient.put(`/clientes/${id}`, datos);
    return response.data;
  },

  // ==========================================
  // SUCURSALES
  // ==========================================
  obtenerSucursalesPorEmpresa: async (empresaId) => {
    try {
      const response = await httpClient.get(`/clientes/${empresaId}/sucursales`);
      return response.data;
    } catch (error) {
      // 🔥 Extrae el mensaje de error que viene desde el backend
      const mensajeReal = error.response?.data?.error || error.message;
      throw new Error(mensajeReal);
    }
  },

  crearSucursal: async (empresaId, datos) => {
    const response = await httpClient.post(`/clientes/${empresaId}/sucursales`, datos);
    return response.data;
  },

  actualizarSucursal: async (sucursalId, datos) => {
    const response = await httpClient.put(`/clientes/sucursales/${sucursalId}`, datos);
    return response.data;
  }
};