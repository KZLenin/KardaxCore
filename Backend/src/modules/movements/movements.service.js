const repository = require('./movements.repository');
// const cromePrinter = require('../hardware/services/cromePrinter'); // Lo activaremos pronto

const crearMovimiento = async (datos, usuarioId) => {
  // 1. Validaciones estrictas
  if (!datos.itemId || !datos.tipoMovimiento || !datos.destinoNombre || !datos.cantidad) {
    throw new Error('Faltan datos: itemId, cantidad, tipoMovimiento y destinoNombre son obligatorios.');
  }

  // 2. REGLA DE NEGOCIO: Validar Stock Disponible
  const item = await repository.obtenerItem(datos.itemId);
  if (!item) throw new Error('El artículo no existe en el inventario.');
  
  if (item.cantidad_stock < datos.cantidad) {
    throw new Error(`Stock insuficiente. Solo quedan ${item.cantidad_stock} unidades de ${item.nombre}.`);
  }

  // 3. REGLA DE NEGOCIO: Actualizar el inventario
  const nuevoStock = item.cantidad_stock - datos.cantidad;
  await repository.actualizarStock(item.id, nuevoStock);

  // 4. Armar y guardar el Movimiento
  const nuevoMovimiento = {
    item_id: datos.itemId,
    tipo_movimiento: datos.tipoMovimiento.trim().toUpperCase(),
    origen_id: datos.origenId || null,
    destino_nombre: datos.destinoNombre.trim(),
    destino_direccion: datos.destinoDireccion ? datos.destinoDireccion.trim() : null,
    precio_venta: datos.precioVenta || null,
    fecha_movimiento: new Date().toISOString()
  };
  const movimientoGuardado = await repository.insertarMovimiento(nuevoMovimiento);

  // 5. REGLA DE NEGOCIO: Trazabilidad y Auditoría (El Gran Hermano)
  const nuevoHistorial = {
    item_id: item.id,
    tipo_accion: 'DESPACHO',
    descripcion: `Se despacharon ${datos.cantidad} unidades de ${item.nombre} hacia ${nuevoMovimiento.destino_nombre}.`,
    usuario_responsable: usuarioId, // Quien tenga la sesión iniciada
    fecha_registro: new Date().toISOString()
  };
  await repository.insertarHistorial(nuevoHistorial);

  // 6. ¡LA MAGIA DE LA ETIQUETA!
  // cromePrinter.imprimirEtiquetaLogistica(item, movimientoGuardado);

  return { ...movimientoGuardado, item, stockRestante: nuevoStock };
};

module.exports = { crearMovimiento };