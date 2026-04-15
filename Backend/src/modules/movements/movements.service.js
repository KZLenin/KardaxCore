// movements.service.js
const repository = require('./movements.repository');

const crearMovimiento = async (datos, usuarioId) => {
  // 1. Validaciones base
  if (!datos.itemId || !datos.tipoMovimiento || !datos.cantidad) {
    throw new Error('Faltan datos obligatorios: itemId, cantidad y tipoMovimiento.');
  }

  const item = await repository.obtenerItem(datos.itemId);
  if (!item) throw new Error('El artículo no existe en el inventario.');

  const tipo = datos.tipoMovimiento.trim().toUpperCase();
  let nuevoStock = item.cantidad_stock;
  let accionHistorial = '';
  let descripcionHistorial = '';
  let destinoNombreMovimiento = 'Bodega Principal'; // Default para ingresos
  
  // Extraemos el motivo detallado (ej. "Devolución de cliente", "Motor quemado")
  const motivoDetalle = datos.motivo ? ` Motivo: ${datos.motivo}.` : '';

  // 2. LA BIFURCACIÓN LÓGICA DE BODEGA
  if (tipo === 'INGRESO') {
    // Escenario 1: Ingresar Equipo
    nuevoStock = item.cantidad_stock + datos.cantidad;
    accionHistorial = 'INGRESO_BODEGA';
    descripcionHistorial = `Se ingresaron ${datos.cantidad} unidades de ${item.nombre}.` + motivoDetalle;
    destinoNombreMovimiento = 'Bodega (Ingreso Interno)';
    nuevoEstadoOperativo = 'Operativo';
  } else if (tipo === 'BAJA') {
    // Escenario 2: Dar de Baja (Se resta del stock, no es una venta)
    if (item.cantidad_stock < datos.cantidad) {
      throw new Error(`No puedes dar de baja ${datos.cantidad}. Solo hay ${item.cantidad_stock} unidades disponibles.`);
    }
    nuevoStock = item.cantidad_stock - datos.cantidad;
    accionHistorial = 'BAJA_TECNICA';
    descripcionHistorial = `Se dio de baja ${datos.cantidad} unidades de ${item.nombre}.` + motivoDetalle;
    destinoNombreMovimiento = 'Descarte / Baja';
    if (nuevoStock === 0) nuevoEstadoOperativo = 'Agotado/Baja';

  } else if (tipo === 'MANTENIMIENTO') {
    // Escenario 3: Taller (Integración con Módulo Técnico)
    accionHistorial = 'ENVIO_TALLER';
    descripcionHistorial = `El equipo fue ingresado a Mantenimiento/Taller.` + motivoDetalle;
    destinoNombreMovimiento = 'Taller Técnico';
    nuevoEstadoOperativo = 'En Reparación';
    
    // 1. Bloqueamos el equipo en el inventario
    await repository.actualizarEstadoOperativo(item.id, 'En Reparación');

    // 2. ¡Creamos la Orden de Trabajo automáticamente!
    const nuevaOrden = {
      item_id: item.id,
      creado_por: usuarioId, // El bodeguero/admin que escaneó
      tipo_mantenimiento: 'Correctivo', // Por defecto, si viene roto es correctivo
      estado: 'Pendiente',
      prioridad: 'Alta', // Podríamos hacerlo dinámico después
      motivo: datos.motivo || 'Ingreso desde Terminal POS de Bodega'
    };
    await repository.crearOrdenTrabajo(nuevaOrden);

  } else if (tipo === 'SALIDA') {
     // Conservamos SALIDA por si la Terminal B2B lo sigue llamando desde sales.service
    if (item.cantidad_stock < datos.cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${item.cantidad_stock} unidades.`);
    }
    nuevoStock = item.cantidad_stock - datos.cantidad;
    accionHistorial = 'DESPACHO_VENTA';
    descripcionHistorial = `Se despacharon ${datos.cantidad} unidades hacia ${datos.destinoNombre || 'Cliente'}.`;
    destinoNombreMovimiento = datos.destinoNombre || 'Cliente Final';
    if (datos.ventaId) nuevoEstadoOperativo = 'Vendido';
  } else {
    throw new Error('Tipo de movimiento no soportado. Usa INGRESO, BAJA o MANTENIMIENTO.');
  }

  // 3. Actualizar Inventario (Solo si el stock realmente cambió)
  if (nuevoStock !== item.cantidad_stock) {
    await repository.actualizarStock(item.id, nuevoStock);
  }

  // 4. Guardar Movimiento Logístico
  const nuevoMovimiento = {
    item_id: datos.itemId,
    tipo_movimiento: tipo === 'BAJA' || tipo === 'MANTENIMIENTO' ? 'SALIDA' : tipo, // Mapeo para la BD
    destino_nombre: destinoNombreMovimiento,
    po_numero: datos.poNumero || null,
    venta_id: datos.ventaId || null,
    fecha_movimiento: new Date().toISOString()
  };
  const movimientoGuardado = await repository.insertarMovimiento(nuevoMovimiento);

  // 5. Trazabilidad (El Historial de Vida)
  const nuevoHistorial = {
    item_id: item.id,
    tipo_accion: accionHistorial,
    descripcion: descripcionHistorial,
    usuario_responsable: usuarioId, 
    fecha_registro: new Date().toISOString()
  };
  await repository.insertarHistorial(nuevoHistorial);

  return { ...movimientoGuardado, item, stockRestante: nuevoStock };
};

const buscarParaMovimiento = async (codigo) => {
  // 1. Buscamos el equipo básico
  const item = await repository.buscarItemPorCodigo(codigo);
  if (!item) throw new Error(`El código [${codigo}] no está registrado en el inventario.`);

  // 2. Buscamos su historial de vida específico
  const historialCrudo = await repository.obtenerHistorialDeItem(item.id);

  // 3. Buscamos si tiene datos de venta y garantía
  const ventaRelacionada = await repository.obtenerVentaDeItem(item.id);

  // 4. Calculamos la Garantía (Si es que se vendió)
  let ventaInfo = null;
  if (ventaRelacionada && ventaRelacionada.venta) {
    const fechaVenta = new Date(ventaRelacionada.venta.fecha_venta);
    const diasGarantia = ventaRelacionada.garantia_dias_cliente || 0;

    // Calculamos cuántos días han pasado
    const hoy = new Date();
    const diffTime = hoy - fechaVenta;
    const diasPasados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diasRestantes = Math.max(0, diasGarantia - diasPasados);

    ventaInfo = {
      cliente: ventaRelacionada.venta.empresa?.nombre_comercial || 'Cliente B2B',
      fechaVenta: ventaRelacionada.venta.fecha_venta,
      garantiaDias: diasGarantia,
      diasRestantes: diasRestantes,
      comprobante: ventaRelacionada.venta.numero_comprobante
    };
  }

  // 5. Calculamos el Estado de Salud actual (Diagnosticando su historia)
  // Si el último movimiento fue ir al taller, su estado es "En Taller"
  let estadoSalud = 'En Bodega';
  if (historialCrudo.length > 0) {
    const ultimoEvento = historialCrudo[0];
    if (ultimoEvento.tipo_accion === 'ENVIO_TALLER') estadoSalud = 'En Taller (Mantenimiento)';
    else if (ventaInfo) estadoSalud = 'Vendido / En Cliente';
  }

  // 6. Armamos el Súper Objeto para la Terminal de React
  return {
    id: item.id,
    codigo_barras: item.codigo_barras || item.serie_fabricante || 'S/N',
    nombre: item.nombre,
    categoria: item.categorias?.nombre || 'General',
    stock: item.cantidad_stock,
    unidad: item.unidad_medida,
    estado: estadoSalud,
    ventaInfo: ventaInfo, // Si es null, el Front mostrará que no se ha vendido
    historial: historialCrudo.map(h => ({
      id: h.id,
      fecha: h.fecha_registro,
      tipo: h.tipo_accion.includes('SALIDA') || h.tipo_accion.includes('DESPACHO') || h.tipo_accion.includes('BAJA') ? 'SALIDA' : 'ENTRADA',
      descripcion: h.descripcion
    }))
  };
};

const listarTodoElHistorial = async () => {
  return await repository.obtenerHistorial();
};




module.exports = { crearMovimiento, buscarParaMovimiento, listarTodoElHistorial };