import httpClient from '@/core/api/httpClient';

export const inventoryService = {
  /**
   * Obtiene el inventario aplicando los filtros (búsqueda, categoría, proveedor, sede)
   */
  getAll: async (filtros = {}) => {
    try {
      // Axios convierte el objeto { categoriaId: 1 } en '?categoriaId=1' automáticamente
      const response = await httpClient.get('/inventory', { params: filtros }); 
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar el inventario';
    }
  },

  /**
   * Obtiene la lista de categorías para el selector
   */
  getCategorias: async () => {
    try {
      const response = await httpClient.get('/inventory/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar categorías';
    }
  },

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

  registrarEntrada: async (datosItem) => {
    try {
      const response = await httpClient.post('/inventory/entrada', datosItem);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al registrar el equipo';
    }
  },

  actualizarEquipo: async (id, datosActualizados) => {
    try {
      const response = await httpClient.put(`/inventory/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al actualizar el equipo';
    }
  },

  getHistorial: async (id) => {
    try {
      const response = await httpClient.get(`/inventory/${id}/historial`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al cargar el historial del equipo';
    }
  },
  
  descargarEtiquetasPDF: async (id, cantidad = 1) => {
    try {
      // Le decimos a Axios: "Prepárate, lo que viene es un archivo (blob), no un JSON"
      const response = await httpClient.get(`/inventory/${id}/etiquetas?cantidad=${cantidad}`, {
        responseType: 'blob' 
      });
      return response.data; // Retorna el archivo crudo
    } catch (error) {
      throw new Error('Error al generar el PDF de etiquetas');
    }
  },

  prepararCargaMasiva: async (datosExcel, diccionarios) => {
    const { sedes, categorias } = diccionarios;

    return datosExcel.map((fila, index) => {
      // 🔍 Buscar ID de la Sede por nombre
      const sedeEncontrada = sedes.find(
        s => s.nombre.toLowerCase() === String(fila.sede).toLowerCase()
      );

      // 🔍 Buscar ID de la Categoría por nombre
      const catEncontrada = categorias.find(
        c => c.nombre.toLowerCase() === String(fila.categoria).toLowerCase()
      );

      // Validamos si algo falta para avisar al usuario
      if (!sedeEncontrada || !catEncontrada) {
        throw new Error(
          `Error en fila ${index + 1}: No se encontró la sede "${fila.sede}" o la categoría "${fila.categoria}".`
        );
      }

      return {
        nombre: fila.nombre.trim().toUpperCase(),
        codigo_barras: String(fila.codigo || ''),
        serie_fabricante: String(fila.serie || ''),
        cantidad_stock: Number(fila.cantidad || 0),
        sede_id: sedeEncontrada.id,
        cat_id: catEncontrada.id,
        detalles: { importado: true, fecha: new Date().toISOString() }
      };
    });
  },

  importarMasivo: async (items) => {
    // Aquí llamas a tu API de backend (la ruta que definimos antes)
    const { data } = await httpClient.post('/inventory/bulk', items);
    return data;
  }

};