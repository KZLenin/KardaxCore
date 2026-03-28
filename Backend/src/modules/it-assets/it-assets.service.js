const itAssetsRepository = require('./it-assets.repository');

const registrarFichaTI = async (datos) => {
  // 1. Regla de negocio innegociable: Un equipo de TI NO existe si no está primero en el Kardex
  if (!datos.itemId) {
    throw new Error('El ID del ítem maestro (Kardex) es obligatorio para registrar la ficha de TI.');
  }

  // 2. Limpieza y formateo de datos (Normalización)
  const equipoLimpio = {
    item_id: datos.itemId,
    marca: datos.marca ? datos.marca.trim().toUpperCase() : null,
    modelo: datos.modelo ? datos.modelo.trim().toUpperCase() : null,
    numero_serie_hardware: datos.numeroSerieHardware ? datos.numeroSerieHardware.trim() : null,
    procesador: datos.procesador ? datos.procesador.trim() : null,
    ram: datos.ram ? datos.ram.trim() : null,
    almacenamiento: datos.almacenamiento ? datos.almacenamiento.trim() : null,
    // Las direcciones MAC siempre deberían guardarse en mayúsculas por convención
    direccion_mac: datos.direccionMac ? datos.direccionMac.trim().toUpperCase() : null,
    usuario_asignado: datos.usuarioAsignado ? datos.usuarioAsignado.trim() : null
  };

  // 3. Mandamos a guardar
  return await itAssetsRepository.crearEquipoTI(equipoLimpio);
};

const obtenerTodosLosEquipos = async () => {
  // Aquí en el futuro podrías agregar lógica para filtrar por estado, etc.
  return await itAssetsRepository.obtenerEquiposTI();
};

module.exports = { registrarFichaTI, obtenerTodosLosEquipos };