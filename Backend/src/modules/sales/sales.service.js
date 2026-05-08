const salesRepository = require('./sales.repository');
const movementsService = require('../movements/movements.service');
const inventoryRepository = require('../inventory/inventory.repository');

const procesarVentaB2B = async (datosVenta, vendedorId) => {
  const { empresaId, sucursalId, items, numeroComprobante, poCliente, notasAdicionales } = datosVenta;

  if (!empresaId || !items || items.length === 0) {
    throw new Error('Datos incompletos para procesar la venta.');
  }

  // 1. OBTENEMOS LA DATA COMPLETA DEL CLIENTE (Para el RUC/Dirección que pide el SRI)
  const clienteFull = await salesRepository.obtenerDataClienteCompleta(empresaId);
  if (!clienteFull) throw new Error("El cliente seleccionado no existe.");

  const detalleSucursal = sucursalId ? await salesRepository.obtenerDetalleSucursal(sucursalId) : null;

  // 2. CÁLCULOS FINANCIEROS (Estándar SRI)
  let subtotalVenta = 0;
  items.forEach(item => {
    subtotalVenta += (Number(item.cantidad) * Number(item.precioUnitario));
  });

  const porcentajeIva = 15; // 🔥 Actualizado a la tarifa vigente en Ecuador
  const valorIva = subtotalVenta * (porcentajeIva / 100);
  const totalVenta = subtotalVenta + valorIva;

  // 3. REGISTRO DE CABECERA DE VENTA
  const nuevaVenta = await salesRepository.crearCabeceraVenta({
    empresa_id: empresaId,
    sucursal_id: sucursalId || null,
    cliente_nombre: clienteFull.nombre_comercial,
    numero_comprobante: numeroComprobante || null,
    po_cliente: poCliente || null,
    notas_adicionales: notasAdicionales || '',
    subtotal: subtotalVenta, // 🔥 Campo nuevo sugerido
    iva: valorIva,           // 🔥 Campo nuevo sugerido
    total_venta: totalVenta,
    vendedor_id: vendedorId,
    estado_sri: 'PENDIENTE' // Para saber si ya se mandó al API de facturación
  });

  const detallesParaGuardar = [];

  for (const item of items) {
    // 4. VALIDACIÓN Y CIERRE DE INVENTARIO
    const equipoDB = await inventoryRepository.obtenerItemPorId(item.itemId);
    
    // A. Registramos el movimiento de salida
    await movementsService.crearMovimiento({
      itemId: item.itemId,
      cantidad: item.cantidad,
      tipoMovimiento: 'SALIDA',
      destinoNombre: `${clienteFull.nombre_comercial} - ${detalleSucursal?.nombre_sucursal || 'Matriz'}`,
      precioVenta: item.precioUnitario,
      garantiaDias: item.garantiaDias,
      ventaId: nuevaVenta.id
    }, vendedorId);

    // B. ACTUALIZACIÓN DE ESTADO (Si es un equipo único con serie, lo marcamos vendido)
    if (equipoDB.unidad_medida === 'UNIDAD') {
        await inventoryRepository.actualizarItem(item.itemId, { estado_operativo: 'Vendido' });
    }

    detallesParaGuardar.push({
      venta_id: nuevaVenta.id,
      item_id: item.itemId,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      garantia_dias_cliente: item.garantiaDias || 0
    });
  }

  await salesRepository.crearDetallesVenta(detallesParaGuardar);

  return { 
    id: nuevaVenta.id, 
    total: totalVenta, 
    cliente: clienteFull.nombre_comercial,
    ruc: clienteFull.identificacion 
  };
};

const obtenerHistorial = async (query = {}) => {
  const buscar = query.buscar || '';
  return await salesRepository.getHistorial(buscar);
}

module.exports = { procesarVentaB2B, obtenerHistorial };