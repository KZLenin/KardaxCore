import httpClient from '@/core/api/httpClient'; // Ajusta a tu configuración de Axios


export const configurationService = {
  // 📖 Leer toda la configuración actual
  obtenerGeneral: async () => {
    const { data } = await httpClient.get('/configuration');
    return data;
  },

  // ✍️ Guardar pestaña de Perfil
  actualizarPerfil: async (datosPerfil) => {
    const { data } = await httpClient.put('/configuration/perfil', datosPerfil);
    return data;
  },

  // ✍️ Guardar pestaña de Inventario
  actualizarInventario: async (datosInventario) => {
    const { data } = await httpClient.put('/configuration/inventario', datosInventario);
    return data;
  },

  // 🖼️ Subir el archivo del Logo
  actualizarLogo: async (archivoDelfile) => {
    const formData = new FormData();
    formData.append('logo', archivoDelfile);

    const { data } = await httpClient.post('/configuration/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  }
};