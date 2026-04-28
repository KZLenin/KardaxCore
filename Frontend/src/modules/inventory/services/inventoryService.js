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
      // 🔥 MAPEO CRÍTICO: React (camelCase) -> Supabase/Node (snake_case)
      const payload = {
        nombre: datosItem.nombre,
        sedeId: datosItem.sedeId,          // Convertimos
        categoriaId: datosItem.categoriaId,    // Convertimos
        proveedorId: datosItem.proveedorId || null,
        serie_fabricante: datosItem.serieFabricante || null,
        codigo_barras: datosItem.codigoBarras || null,
        cantidad_stock: datosItem.cantidadStock, // Convertimos
        unidad_medida: datosItem.unidadMedida,   // Convertimos
        // Nuevos campos de Taller
        es_externo: datosItem.es_externo,
        cliente_id: datosItem.clienteId || null,
        sucursal_id: datosItem.sucursalId || null,
        notas_ingreso: datosItem.notasIngreso || null
      };

      const response = await httpClient.post('/inventory/entrada', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error al registrar el equipo';
    }
  },

  getClientes: async () => {
    try {
      
      const response = await httpClient.get('/clientes'); 
      return response.data;
    } catch (error) {
      console.error("Error cargando clientes:", error);
      return []; // Devolvemos array vacío para no romper la vista
    }
  },

  
  getSucursales: async () => {
    try {
      const response = await httpClient.get('/clientes/sucursales/todas'); 
      return response.data;
    } catch (error) {
      console.error("Error cargando sucursales:", error);
      return []; // Devolvemos array vacío para no romper la vista
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

  // 🔥 LÓGICA DE IMPORTACIÓN MASIVA RECUPERADA
  prepararCargaMasiva: async (datosPrevia, catalogos) => {
    const { sedes, categorias } = catalogos;
    
    return datosPrevia.map(item => {
      // Buscamos si el texto del Excel coincide con la base de datos (ignorando mayúsculas)
      const sedeEncontrada = sedes.find(s => s.nombre.toLowerCase() === item.sedeNombre?.toLowerCase());
      const catEncontrada = categorias.find(c => c.nombre.toLowerCase() === item.categoriaNombre?.toLowerCase());

      if (!sedeEncontrada) {
        throw new Error(`La sede "${item.sedeNombre}" del equipo "${item.nombre}" no existe en el sistema.`);
      }

      // Devolvemos el objeto tal cual lo espera tu base de datos
      return {
        nombre: item.nombre,
        codigo_barras: item.codigo || null,
        serie_fabricante: item.serie || null,
        cantidad_stock: item.cantidad || 1,
        sede_id: sedeEncontrada.id,
        cat_id: catEncontrada ? catEncontrada.id : null,
        unidad_medida: 'UNIDAD', // Por defecto para masivos
        es_externo: false
      };
    });
  },

  importarMasivo: async (items) => {
    // Usamos post para enviar el array gigante
    const response = await httpClient.post('/inventory/importar-masivo', { items });
    return response.data;
  },

  getSedes: async () => {
  try {
    const response = await httpClient.get('/inventory/sedes');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al cargar sedes';
  }
},

imprimirEtiquetasMasivas: async (idsArray) => {
  try {
    // Es clave el responseType: 'blob' para que no se corrompa el PDF
    const response = await httpClient.post('/inventory/etiquetas/masivo', { ids: idsArray }, {
      responseType: 'blob' 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al descargar las etiquetas';
  }
},

exportarExcel: async (payload) => {
    const response = await httpClient.post('/inventory/exportar', payload, {
      responseType: 'blob' 
    });
    
    return response.data;
  },
};