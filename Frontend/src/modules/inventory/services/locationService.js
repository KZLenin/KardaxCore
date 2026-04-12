import httpClient from '@/core/api/httpClient';

const handleRequest = async (request, errorMessage) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw error?.response?.data?.error || errorMessage;
  }
};

export const locationService = {
  getSedes: () =>
    handleRequest(() => httpClient.get('/sedes'), 'Error al cargar sedes'),

  getCiudades: () =>
    handleRequest(() => httpClient.get('/ciudades'), 'Error al cargar ciudades'),

  getPaises: () =>
    handleRequest(() => httpClient.get('/paises'), 'Error al cargar países'),

  registrarSede: (datosSede) =>
    handleRequest(() => httpClient.post('/sedes', datosSede), 'Error al registrar la sede'),

  registrarCiudad: (datosCiudad) =>
    handleRequest(() => httpClient.post('/ciudades', datosCiudad), 'Error al registrar la ciudad'),

  registrarPais: (datosPais) =>
    handleRequest(() => httpClient.post('/paises', datosPais), 'Error al registrar el país'),
};