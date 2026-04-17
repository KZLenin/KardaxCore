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
  let destinoNombreMovimiento = 'Bodega Principal';
  
  // 🔥 FIX 1: Declaramos la variable del estado inicial para que no explote
  let nuevoEstadoOperativo = item.estado_operativo || 'Operativo'; 
  
  const motivoDetalle = datos.motivo ? ` Motivo: ${datos.motivo}.` : '';

  // 2. LA BIFURCACIÓN LÓGICA DE BODEGA
  if (tipo === 'INGRESO') {
    nuevoStock = item.cantidad_stock + datos.cantidad;
    accionHistorial = 'INGRESO_BODEGA';
    descripcionHistorial = `Se ingresaron ${datos.cantidad} unidades de ${item.nombre}.` + motivoDetalle;
    destinoNombreMovimiento = 'Bodega (Ingreso Interno)';
    nuevoEstadoOperativo = 'Operativo'; // Vuelve a estar disponible

  } else if (tipo === 'BAJA') {
    if (item.cantidad_stock < datos.cantidad) {
      throw new Error(`No puedes dar de baja ${datos.cantidad}. Solo hay ${item.cantidad_stock} unidades disponibles.`);
    }
    nuevoStock = item.cantidad_stock - datos.cantidad;
    accionHistorial = 'BAJA_TECNICA';
    descripcionHistorial = `Se dio de baja ${datos.cantidad} unidades de ${item.nombre}.` + motivoDetalle;
    destinoNombreMovimiento = 'Descarte / Baja';
    if (nuevoStock === 0) nuevoEstadoOperativo = 'Agotado/Baja';

  } else if (tipo === 'MANTENIMIENTO') {
    accionHistorial = 'ENVIO_TALLER';
    descripcionHistorial = `El equipo fue ingresado a Mantenimiento/Taller.` + motivoDetalle;
    destinoNombreMovimiento = 'Taller Técnico';
    nuevoEstadoOperativo = 'En Reparación'; // Bloqueado para ventas

    // Creamos la Orden de Trabajo automáticamente
    const nuevaOrden = {
      item_id: item.id,
      creado_por: usuarioId, 
      tipo_mantenimiento: 'Correctivo', 
      estado: 'Pendiente',
      prioridad: 'Alta', 
      motivo: datos.motivo || 'Ingreso desde Terminal POS de Bodega'
    };
    await repository.crearOrdenTrabajo(nuevaOrden);

  } else if (tipo === 'SALIDA') {
    if (item.cantidad_stock < datos.cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${item.cantidad_stock} unidades.`);
    }
    nuevoStock = item.cantidad_stock - datos.cantidad;
    accionHistorial = 'DESPACHO_VENTA';
    // Usamos el destinoNombre dinámico que ahora manda sales.service.js
    descripcionHistorial = `Se despacharon ${datos.cantidad} unidades hacia ${datos.destinoNombre || 'Cliente'}.`;
    destinoNombreMovimiento = datos.destinoNombre || 'Cliente Final';
    if (datos.ventaId) {
      // Si vendes la última unidad (ej. Laptop), se marca como Vendido.
      // Si aún te queda stock (ej. 50 metros de cable restantes), sigue Operativo.
      nuevoEstadoOperativo = nuevoStock === 0 ? 'Vendido' : 'Operativo'; 
    }
  } else {
    throw new Error('Tipo de movimiento no soportado. Usa INGRESO, BAJA o MANTENIMIENTO.');
  }

  // 🔥 FIX: Actualizamos Stock y Estado al mismo tiempo (Atómico)
  if (nuevoStock !== item.cantidad_stock || nuevoEstadoOperativo !== item.estado_operativo) {
    
    // Si la cantidad llega a 0 por una BAJA normal (NO por venta), forzamos a Agotado
    if (nuevoStock === 0 && nuevoEstadoOperativo !== 'Vendido') {
      nuevoEstadoOperativo = 'Agotado/Baja';
    }
    
    // Llamamos a la BD con los datos correctos
    await repository.actualizarKardex(item.id, nuevoStock, nuevoEstadoOperativo);
  }

  // 4. Guardar Movimiento Logístico (El Log)
  const nuevoMovimiento = {
    item_id: datos.itemId,
    tipo_movimiento: tipo === 'BAJA' || tipo === 'MANTENIMIENTO' ? 'SALIDA' : tipo, 
    destino_nombre: destinoNombreMovimiento,

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
    venta_id: datos.ventaId || null, 
    fecha_registro: new Date().toISOString()
  };
  await repository.insertarHistorial(nuevoHistorial);

  return { ...movimientoGuardado, item, stockRestante: nuevoStock, estado: nuevoEstadoOperativo };
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