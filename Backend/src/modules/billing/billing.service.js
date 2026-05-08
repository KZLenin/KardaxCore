const repository = require('./billing.repository');

// 1. Obtener lo que falta facturar
const obtenerPendientes = async () => {
  return await repository.getVentasPendientes();
};

// 2. Agrupar órdenes y generar la Factura
const generarFactura = async (payload, usuarioId) => {
  const { empresaId, ventasIds, notas } = payload;

  if (!empresaId || !ventasIds || ventasIds.length === 0) {
    throw new Error("Faltan datos para generar la factura");
  }

  // 2.1 Traer las ventas para sumar los totales reales de la BD
  const pendientes = await repository.getVentasPendientes();
  const ventasAFiltrar = pendientes.filter(v => ventasIds.includes(v.id) && v.empresa_id === empresaId);

  if (ventasAFiltrar.length !== ventasIds.length) {
    throw new Error("Algunas órdenes no pertenecen a este cliente o ya fueron facturadas.");
  }

  // 2.2 Calcular sumatorias
  const subtotal = ventasAFiltrar.reduce((sum, v) => sum + Number(v.subtotal), 0);
  const iva = ventasAFiltrar.reduce((sum, v) => sum + Number(v.iva), 0);
  const total = ventasAFiltrar.reduce((sum, v) => sum + Number(v.total_venta), 0);

  // 2.3 Calcular fecha de vencimiento según los días de crédito del cliente
  const { dias_credito } = await repository.getEmpresaCredito(empresaId);
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + (dias_credito || 0));

  // 2.4 Guardar la cabecera de la factura
  const nuevaFactura = await repository.crearFactura({
    empresa_id: empresaId,
    subtotal,
    iva,
    total_facturado: total,
    saldo_pendiente: total, // Nace debiendo todo
    estado_pago: 'PENDIENTE',
    dias_credito: dias_credito || 0,
    fecha_vencimiento: fechaVencimiento.toISOString(),
    notas: notas || '',
    creado_por: usuarioId
  });

  // 2.5 Marcar las órdenes como facturadas
  await repository.enlazarVentasAFactura(ventasIds, nuevaFactura.id);

  // 🔥 NOTA PARA FASE 3: Aquí insertaremos la llamada con Axios al API de Docker (SRI) 
  // para enviarle el JSON y obtener la clave de acceso oficial.

  return nuevaFactura;
};

// 3. Obtener el historial de facturas (Cartera)
const obtenerCartera = async () => {
  return await repository.getCartera();
};

// 4. Registrar un pago (Abono o Liquidación)
const registrarAbono = async (facturaId, payload, usuarioId) => {
  const { monto, metodo_pago, banco_destino, comprobante_referencia, notas } = payload;

  const factura = await repository.getFacturaById(facturaId);
  
  if (factura.estado_pago === 'PAGADO') {
    throw new Error('Esta factura ya está pagada por completo.');
  }

  if (Number(monto) > Number(factura.saldo_pendiente)) {
    throw new Error(`El monto supera el saldo pendiente ($${factura.saldo_pendiente}).`);
  }

  // Guardar el recibo del pago
  await repository.registrarCobro({
    factura_id: facturaId,
    monto,
    metodo_pago,
    banco_destino,
    comprobante_referencia,
    notas,
    registrado_por: usuarioId
  });

  // Actualizar la factura madre
  const nuevoSaldo = Number(factura.saldo_pendiente) - Number(monto);
  const nuevoEstado = nuevoSaldo <= 0.01 ? 'PAGADO' : 'PARCIAL'; // 0.01 por temas de decimales en JS

  await repository.actualizarSaldoFactura(facturaId, nuevoSaldo, nuevoEstado);

  return { nuevoSaldo, estadoPago: nuevoEstado };
};

module.exports = {
  obtenerPendientes,
  generarFactura,
  obtenerCartera,
  registrarAbono
};