const sparepartsRepository = require('./spareparts.repository');
// 🔥 Importamos el repo de inventario para poder descontar el stock y registrar el movimiento
const inventoryRepository = require('../inventory/inventory.repository'); 

const consumirRepuestoEnOrden = async (ordenId, itemId, cantidadConsumida, usuarioId) => {
  if (!ordenId || !itemId || !cantidadConsumida) {
    throw new Error('Faltan datos para registrar el consumo del repuesto.');
  }

  // 1. Verificamos que el repuesto exista y sea interno
  const repuesto = await sparepartsRepository.verificarStockRepuesto(itemId);
  if (repuesto.es_externo) {
    throw new Error('Bloqueo de seguridad: No puedes consumir un equipo de un cliente como repuesto.');
  }

  // 2. Verificamos que haya suficiente stock
  if (repuesto.cantidad_stock < cantidadConsumida) {
    throw new Error(`Stock insuficiente. Solo quedan ${repuesto.cantidad_stock} unidades de ${repuesto.nombre}.`);
  }

  // 3. Calculamos el nuevo stock y lo actualizamos en la tabla inventario
  const nuevoStock = repuesto.cantidad_stock - cantidadConsumida;
  await inventoryRepository.actualizarItem(itemId, { cantidad_stock: nuevoStock });

  // 4. Registramos el repuesto en la tabla puente
  const registroConsumo = await sparepartsRepository.agregarRepuestoAOrden({
    orden_id: ordenId,
    item_id: itemId,
    cantidad: cantidadConsumida,
    usuario_id: usuarioId,
    costo_unitario: 0 // Si en el futuro agregas costo al Kardex, lo jalas en el paso 1 y lo pones aquí
  });

  // 5. Dejamos huella en el Historial de Seguimiento (El Cronista)
  await inventoryRepository.registrarHistorial(
    itemId,
    'CONSUMO_TALLER',
    `Se consumieron ${cantidadConsumida} unidades en la Orden de Trabajo ID: ${ordenId}`,
    usuarioId
  );

  // 6. Registramos la Salida en Movimientos Logísticos
  await inventoryRepository.registrarMovimiento({
    item_id: itemId,
    tipo_movimiento: 'SALIDA',
    cantidad: cantidadConsumida,
    sede_destino_id: null, 
    usuario_id: usuarioId,
    observaciones: `Consumo interno para mantenimiento (Orden: ${ordenId})`
  });

  return registroConsumo;
};

const listarRepuestosDeOrden = async (ordenId) => {
  if (!ordenId) throw new Error('El ID de la orden es obligatorio.');
  return await sparepartsRepository.obtenerRepuestosPorOrden(ordenId);
};

module.exports = {
  consumirRepuestoEnOrden,
  listarRepuestosDeOrden
};