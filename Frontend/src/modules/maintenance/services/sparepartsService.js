import httpClient from '@/core/api/httpClient';

export const sparepartsService = {
  // Obtener los repuestos que ya tiene asignados la orden
  getByOrden: async (ordenId) => {
    const { data } = await httpClient.get(`/spareparts/ordenes/${ordenId}`);
    return data;
  },

  // Registrar el consumo de un nuevo repuesto
  agregarARepuesto: async (ordenId, itemId, cantidad, costo) => {
    const { data } = await httpClient.post(`/spareparts/ordenes/${ordenId}`, {
      item_id: itemId,
      cantidad: cantidad,
      costo: costo
    });
    return data;
  }
};