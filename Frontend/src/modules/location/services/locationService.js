import httpClient from '@/core/api/httpClient';

export const locationService = {
  // --- PAÍSES ---
  getPaises: async () => {
    const response = await httpClient.get('/locations/paises');
    return response.data;
  },
  registrarPais: async (datos) => {
    const response = await httpClient.post('/locations/paises', datos);
    return response.data;
  },
  actualizarPais: async (id, datos) => {
    const response = await httpClient.put(`/locations/paises/${id}`, datos);
    return response.data;
  },

  // --- CIUDADES (Los usaremos luego) ---
  getCiudades: async () => {
    const response = await httpClient.get('/locations/ciudades');
    return response.data;
  },
  registrarCiudad: async (datos) => {
    const response = await httpClient.post('/locations/ciudades', datos);
    return response.data;
  },
  actualizarCiudad: async (id, datos) => {
    const response = await httpClient.put(`/locations/ciudades/${id}`, datos);
    return response.data;
  },

  // --- SEDES ---
  getSedes: async () => {
    const response = await httpClient.get('/locations/sedes');
    return response.data;
  },
  registrarSede: async (datos) => {
    const response = await httpClient.post('/locations/sedes', datos);
    return response.data;
  },
  actualizarSede: async (id, datos) => {
    const response = await httpClient.put(`/locations/sedes/${id}`, datos);
    return response.data;
  },
};