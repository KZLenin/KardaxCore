const repository = require('./movements.repository');
// const cromePrinter = require('../hardware/services/cromePrinter'); // Lo activaremos pronto
const buscarParaMovimiento = async (codigo) => {
  const item = await repository.buscarItemPorCodigo(codigo);
  if (!item) throw new Error(`El código [${codigo}] no está registrado en el inventario.`);
  return item;
};

const crearMovimiento = async (datos, usuarioId) => {
  // 1. Validaciones estrictas
  if (!datos.itemId || !datos.tipoMovimiento || !datos.destinoNombre || !datos.cantidad) {
    throw new Error('Faltan datos: itemId, cantidad, tipoMovimiento y destinoNombre son obligatorios.');
  }

  // 2. REGLA DE NEGOCIO: Validar Stock Disponible
  const item = await repository.obtenerItem(datos.itemId);
  if (!item) throw new Error('El artículo no existe en el inventario.');

  // 3. Declaramos las variables que van a mutar dependiendo de si es ingreso o salida
  const tipo = datos.tipoMovimiento.trim().toUpperCase();
  let nuevoStock = item.cantidad_stock;
  let accionHistorial = '';
  let descripcionHistorial = '';

  // 4. LA BIFURCACIÓN LÓGICA (Ingreso vs Salida)
  if (tipo === 'SALIDA') {
    if (item.cantidad_stock < datos.cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${item.cantidad_stock} unidades de ${item.nombre}.`);
    }
    nuevoStock = item.cantidad_stock - datos.cantidad;
    accionHistorial = 'DESPACHO';
    descripcionHistorial = `Se despacharon ${datos.cantidad} unidades de ${item.nombre} hacia ${datos.destinoNombre}.`;
    if (datos.numeroComprobante || datos.poCliente) {
      descripcionHistorial += ` Recibo: ${datos.numeroComprobante || 'S/N'} | PO Cliente: ${datos.poCliente || 'S/N'}.`;
    }
  } else if (tipo === 'INGRESO') {
    nuevoStock = item.cantidad_stock + datos.cantidad;
    accionHistorial = 'INGRESO';
    descripcionHistorial = `Ingresaron ${datos.cantidad} unidades de ${item.nombre} desde ${datos.destinoNombre}. PO Proveedor: ${datos.poNumero || 'S/N'}.`;
  } else {
    throw new Error('Tipo de movimiento no soportado. Usa INGRESO o SALIDA.');
  }

  // 5. REGLA DE NEGOCIO: Actualizar el inventario
  await repository.actualizarStock(item.id, nuevoStock);

  // 6. Armar y guardar el Movimiento
  const nuevoMovimiento = {
    item_id: datos.itemId,
    tipo_movimiento: tipo,
    origen_id: datos.origenId || null,
    destino_nombre: datos.destinoNombre.trim(),
    destino_direccion: datos.destinoDireccion ? datos.destinoDireccion.trim() : null,
    precio_venta: tipo === 'SALIDA' ? datos.precioVenta : null,
    costo_unitario: tipo === 'INGRESO' ? datos.costoUnitario : null,
    po_numero: datos.poNumero || null,
    garantia_dias: parseInt(datos.garantiaDias) || 0,
    precio_venta: datos.precioVenta || null,
    venta_id: datos.ventaId || null,
    fecha_movimiento: new Date().toISOString()
  };
  const movimientoGuardado = await repository.insertarMovimiento(nuevoMovimiento);

  // 7. REGLA DE NEGOCIO: Trazabilidad y Auditoría (El Gran Hermano) usando variables dinámicas
  const nuevoHistorial = {
    item_id: item.id,
    tipo_accion: accionHistorial,
    descripcion: descripcionHistorial,
    venta_id: datos.ventaId || null,
    usuario_responsable: usuarioId, // Quien tenga la sesión iniciada
    fecha_registro: new Date().toISOString()
  };
  await repository.insertarHistorial(nuevoHistorial);

  // 8. ¡LA MAGIA DE LA ETIQUETA!
  // cromePrinter.imprimirEtiquetaLogistica(item, movimientoGuardado);

  return { ...movimientoGuardado, item, stockRestante: nuevoStock };
};

const listarTodoElHistorial = async () => {
  return await repository.obtenerHistorial();
};

module.exports = { crearMovimiento, buscarParaMovimiento, listarTodoElHistorial, };