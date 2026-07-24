const quotesRepository = require('./quotes.repository');
const inventoryRepository = require('../inventory/inventory.repository');
const salesService = require('../sales/sales.service'); // 🔥 INTEGRACIÓN DE MÓDULOS

const generarCotizacionDesdeOrden = async (datosOrden) => {
  if (!datosOrden.cliente_id) throw new Error('Se requiere el ID del cliente.');
  if (!datosOrden.repuestos || datosOrden.repuestos.length === 0) {
    throw new Error('La orden no tiene repuestos para cotizar.');
  }

  const detallesParaInsertar = [];
  const repuestosSinStock = [];

  for (const repuesto of datosOrden.repuestos) {
    const itemBD = await inventoryRepository.verificarDisponibilidadItem(repuesto.item_id);
    
    if (itemBD && itemBD.cantidad_stock >= repuesto.cantidad) {
      detallesParaInsertar.push({
        item_id: repuesto.item_id,
        cantidad: repuesto.cantidad,
        precio_unitario: repuesto.precio_unitario, 
        estado_aprobacion: null 
      });
    } else {
      repuestosSinStock.push({
        item: itemBD ? itemBD.nombre : 'Desconocido',
        solicitado: repuesto.cantidad,
        disponible: itemBD ? itemBD.cantidad_stock : 0
      });
    }
  }

  if (detallesParaInsertar.length === 0) {
    throw new Error('No hay stock suficiente para ninguno de los repuestos solicitados.');
  }

  const nuevaCotizacion = await quotesRepository.crearCotizacionBase({
    cliente_id: datosOrden.cliente_id,
    numero_orden_externa: datosOrden.numero_orden || null,
    estado: 'PENDIENTE',
    notas_adicionales: datosOrden.notas || 'Cotización generada automáticamente desde orden.'
  });

  const detallesConId = detallesParaInsertar.map(det => ({
    ...det,
    cotizacion_id: nuevaCotizacion.id
  }));
  
  await quotesRepository.insertarDetallesCotizacion(detallesConId);

  return {
    mensaje: 'Cotización generada exitosamente',
    cotizacion_id: nuevaCotizacion.id,
    advertencias: repuestosSinStock.length > 0 ? repuestosSinStock : null
  };
};

const listarCotizaciones = async (filtros) => {
  return await quotesRepository.obtenerCotizaciones(filtros);
};

const obtenerDetalleCotizacion = async (id) => {
  if (!id) throw new Error('El ID de la cotización es obligatorio');
  
  const cotizacion = await quotesRepository.obtenerCotizacionConDetalles(id);
  
  let granTotal = 0;
  if (cotizacion.cotizaciones_detalle) {
    cotizacion.cotizaciones_detalle.forEach(det => {
      const subtotal = det.cantidad * Number(det.precio_unitario);
      det.subtotal = subtotal; 
      granTotal += subtotal;
    });
  }
  
  cotizacion.total_estimado = granTotal;
  return cotizacion;
};

const actualizarCotizacion = async (id, datos) => {
  if (!id) throw new Error('El ID de la cotización es obligatorio para actualizar');
  return await quotesRepository.actualizarCotizacionBase(id, datos);
};

const procesarAprobacion = async (idCotizacion, idsDetallesAceptados, usuarioId) => {
  const cotizacion = await quotesRepository.obtenerCotizacionConDetalles(idCotizacion);
  
  if (!cotizacion || cotizacion.estado !== 'PENDIENTE') {
    throw new Error('Cotización no válida o ya procesada');
  }

  const aceptados = [];
  const rechazados = [];
  
  for (const det of cotizacion.cotizaciones_detalle) {
    if (idsDetallesAceptados.includes(det.id)) {
      aceptados.push(det);
    } else {
      rechazados.push(det.id);
    }
  }

  if (aceptados.length === 0) throw new Error('Debes aceptar al menos un repuesto.');

  // 1. Guardamos los estados en la cotización
  const idsParaAprobar = aceptados.map(a => a.id);
  await quotesRepository.actualizarEstadoDetalles(idsParaAprobar, rechazados);

  // 2. Preparamos el payload exacto que tu servicio de ventas espera
  const itemsParaVenta = aceptados.map(det => ({
    itemId: det.inventario.id,
    cantidad: det.cantidad,
    precioUnitario: det.precio_unitario,
    garantiaDias: 0 // Ajustable según tu lógica de repuestos
  }));

  const datosVenta = {
    empresaId: cotizacion.cliente_id,
    sucursalId: null, // Asumimos matriz por defecto, puedes inyectar el ID si lo tienes
    items: itemsParaVenta,
    numeroComprobante: null, 
    poCliente: cotizacion.numero_orden_externa,
    notasAdicionales: `Venta generada desde Cotización #${cotizacion.id}`
  };

  // 3. 🚀 Llamamos a TU motor de ventas (Esto hace el descuento, IVA, historial y todo)
  const resultadoVenta = await salesService.procesarVentaB2B(datosVenta, usuarioId);

  // 4. Marcamos la cotización como aprobada
  const estadoFinal = rechazados.length === 0 ? 'APROBADA_TOTAL' : 'APROBADA_PARCIAL';
  await quotesRepository.actualizarCotizacionBase(idCotizacion, { estado: estadoFinal });

  return {
    mensaje: `Cotización ${estadoFinal}. Venta generada con éxito.`,
    venta: resultadoVenta
  };
};

module.exports = {
  generarCotizacionDesdeOrden,
  listarCotizaciones,
  obtenerDetalleCotizacion,
  actualizarCotizacion,
  procesarAprobacion,    
};