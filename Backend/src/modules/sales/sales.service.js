const salesRepository = require('./sales.repository');
// 🔥 IMPORTAMOS TU MOTOR LOGÍSTICO EXISTENTE 🔥
const movementsService = require('../movements/movements.service'); // Ajusta la ruta si es necesario

const procesarVentaB2B = async (datosVenta, vendedorId) => {
  const { clienteNombre, numeroComprobante, poCliente, notasAdicionales, items } = datosVenta;

  if (!clienteNombre || !items || items.length === 0) {
    throw new Error('El nombre del cliente y al menos un artículo son obligatorios.');
  }

  // 1. Calculamos el total matemático
  const totalVenta = items.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);

  // 2. Creamos el "Recibo" maestro
  const nuevaVenta = await salesRepository.crearCabeceraVenta({
    cliente_nombre: clienteNombre,
    numero_comprobante: numeroComprobante || null,
    po_cliente: poCliente || null,
    notas_adicionales: notasAdicionales || '',
    total_venta: totalVenta,
    vendedor_id: vendedorId
  });

  const detallesParaGuardar = [];

  // 3. Procesamos cada artículo en el carrito de compras
  for (const item of items) {
    // A. 🚚 DISPARAMOS EL KARDEX LOGÍSTICO: Descuenta stock y guarda historial
    await movementsService.crearMovimiento({
      itemId: item.itemId,
      cantidad: item.cantidad,
      tipoMovimiento: 'SALIDA',
      destinoNombre: clienteNombre, // El destino es el cliente
      precioVenta: item.precioUnitario,
      garantiaDias: item.garantiaDias,
      numeroComprobante: numeroComprobante, 
      poCliente: poCliente,
      ventaId: nuevaVenta.id
    }, vendedorId);

    // B. 🛒 PREPARAMOS EL DETALLE COMERCIAL: Para tu factura
    detallesParaGuardar.push({
      venta_id: nuevaVenta.id,
      item_id: item.itemId,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      garantia_dias_cliente: item.garantiaDias || 0
    });
  }

  // 4. Guardamos todos los detalles en la base de datos de un solo golpe
  await salesRepository.crearDetallesVenta(detallesParaGuardar);

  return { ...nuevaVenta, total_items: items.length };
};

const obtenerHistorial = async (query) => {
  const { buscar } = query; // Extraemos el término de búsqueda
  // Aquí podrías agregar más lógica de negocio en el futuro si la necesitas
  const historial = await salesRepository.getHistorial(buscar);
  return historial;
}

module.exports = { procesarVentaB2B, obtenerHistorial };