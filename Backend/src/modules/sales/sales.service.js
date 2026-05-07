const salesRepository = require('./sales.repository');
const movementsService = require('../movements/movements.service');
const inventoryRepository = require('../inventory/inventory.repository');

const procesarVentaB2B = async (datosVenta, vendedorId) => {
  // 🔥 1. AHORA EXTRAEMOS LOS IDs QUE MANDA EL FRONTEND
  const { empresaId, sucursalId, numeroComprobante, poCliente, notasAdicionales, items } = datosVenta;

  // Validamos con los nuevos campos
  if (!empresaId || !sucursalId || !items || items.length === 0) {
    throw new Error('Empresa, sucursal y al menos un artículo son obligatorios.');
  }

  const estadosBloqueados = ['En Reparación', 'Agotado/Baja', 'En Mantenimiento', 'Vendido'];

  for (const item of items) {
    // Vamos a buscar el equipo a la base de datos para ver su verdad
    const equipoDB = await inventoryRepository.obtenerItemPorId(item.itemId);
    
    if (!equipoDB) {
      throw new Error(`Uno de los equipos seleccionados ya no existe en el sistema.`);
    }

    // Si tiene un estado prohibido, reventamos la operación inmediatamente
    if (estadosBloqueados.includes(equipoDB.estado_operativo)) {
      throw new Error(`¡Alto ahí! No puedes vender "${equipoDB.nombre}" porque su estado actual es: ${equipoDB.estado_operativo}.`);
    }
  }

  const nombreEmpresaReal = await salesRepository.obtenerNombreEmpresa(empresaId);
  const detalleSucursal = await salesRepository.obtenerDetalleSucursal(sucursalId);
  const destinoFinal = `${nombreEmpresaReal} - ${detalleSucursal.nombre_sucursal}`;
  const totalVenta = items.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);

  // 🔥 2. GUARDAMOS LA VENTA CON LOS PUENTES RELACIONALES
  const nuevaVenta = await salesRepository.crearCabeceraVenta({
    empresa_id: empresaId,       // Apunta a clientes_empresas
    sucursal_id: sucursalId,     // Apunta a clientes_sucursales
    cliente_nombre: nombreEmpresaReal || 'Cliente B2B', // Texto por defecto por si tu BD aún lo exige
    numero_comprobante: numeroComprobante || null,
    po_cliente: poCliente || null,
    notas_adicionales: notasAdicionales || '',
    total_venta: totalVenta,
    vendedor_id: vendedorId
  });

  const detallesParaGuardar = [];

  for (const item of items) {
    // A. KARDEX LOGÍSTICO
    await movementsService.crearMovimiento({
      itemId: item.itemId,
      cantidad: item.cantidad,
      tipoMovimiento: 'SALIDA',
      destinoNombre: destinoFinal, // Opcional: Podrías buscar el nombre real de la sucursal
      precioVenta: item.precioUnitario,
      garantiaDias: item.garantiaDias,
      numeroComprobante: numeroComprobante, 
      poNumero: poCliente,           
      ventaId: nuevaVenta.id
    }, vendedorId);

    // B. DETALLE COMERCIAL
    detallesParaGuardar.push({
      venta_id: nuevaVenta.id,
      item_id: item.itemId,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      garantia_dias_cliente: item.garantiaDias || 0
    });
  }

  await salesRepository.crearDetallesVenta(detallesParaGuardar);

  return { ...nuevaVenta, total_items: items.length };
};

const obtenerHistorial = async (query) => {
  const { buscar } = query;
  return await salesRepository.getHistorial(buscar);
}

module.exports = { procesarVentaB2B, obtenerHistorial };