import httpClient from '@/core/api/httpClient';

export const dashboardService = {
  getDashboardData: async () => {
    try {
      const response = await httpClient.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar los datos del Dashboard';
    }
  }
};