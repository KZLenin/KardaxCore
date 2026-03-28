const repository = require('./movements.repository');
// const cromePrinter = require('../hardware/services/cromePrinter'); // Lo activaremos pronto

const crearMovimiento = async (datos) => {
  // 1. Validaciones estrictas
  if (!datos.itemId || !datos.tipoMovimiento || !datos.destinoNombre) {
    throw new Error('Faltan datos: itemId, tipoMovimiento y destinoNombre son obligatorios.');
  }

  // 2. Armamos el objeto tal como lo espera la base de datos
  const nuevoMovimiento = {
    item_id: datos.itemId,
    tipo_movimiento: datos.tipoMovimiento.trim().toUpperCase(), // Ej: 'VENTA', 'TRASLADO'
    origen_id: datos.origenId || null,
    destino_nombre: datos.destinoNombre.trim(),
    destino_direccion: datos.destinoDireccion ? datos.destinoDireccion.trim() : null,
    precio_venta: datos.precioVenta || null
  };

  // 3. Guardamos en la base de datos
  const resultado = await repository.registrarMovimiento(nuevoMovimiento);

  // 4. ¡LA MAGIA DE LA ETIQUETA 2!
  // Aquí dispararemos la impresión asíncrona. Le pasamos los datos del ítem y del envío.
  // cromePrinter.imprimirEtiquetaLogistica(resultado.item, resultado);

  return resultado;
};

module.exports = { crearMovimiento };