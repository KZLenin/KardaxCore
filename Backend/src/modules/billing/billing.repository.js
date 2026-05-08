const supabase = require('../../config/supabase');

// --- FACTURACIÓN ---
const getVentasPendientes = async () => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      empresa:clientes_empresas(nombre_comercial, identificacion)
    `)
    .eq('estado_facturacion', 'NO_FACTURADO')
    .order('fecha_venta', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getEmpresaCredito = async (empresaId) => {
  const { data, error } = await supabase
    .from('clientes_empresas')
    .select('dias_credito')
    .eq('id', empresaId)
    .single();
  
  if (error) return { dias_credito: 0 };
  return data;
};

const crearFactura = async (facturaData) => {
  const { data, error } = await supabase
    .from('facturas')
    .insert([facturaData])
    .select()
    .single();

  if (error) throw new Error(`Error BD Factura: ${error.message}`);
  return data;
};

const enlazarVentasAFactura = async (ventasIds, facturaId) => {
  const { error } = await supabase
    .from('ventas')
    .update({ 
      estado_facturacion: 'FACTURADO',
      factura_id: facturaId 
    })
    .in('id', ventasIds);

  if (error) throw new Error(`Error enlazando ventas: ${error.message}`);
};

// --- CARTERA Y PAGOS ---
const getCartera = async () => {
  const { data, error } = await supabase
    .from('facturas')
    .select(`
      *,
      empresa:clientes_empresas(nombre_comercial, telefono)
    `)
    .order('fecha_emision', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getFacturaById = async (id) => {
  const { data, error } = await supabase.from('facturas').select('*').eq('id', id).single();
  if (error) throw new Error('Factura no encontrada');
  return data;
};

const registrarCobro = async (pagoData) => {
  const { error } = await supabase.from('facturas_cobros').insert([pagoData]);
  if (error) throw new Error(`Error guardando pago: ${error.message}`);
};

const actualizarSaldoFactura = async (facturaId, nuevoSaldo, estadoPago) => {
  const { error } = await supabase
    .from('facturas')
    .update({ saldo_pendiente: nuevoSaldo, estado_pago: estadoPago })
    .eq('id', facturaId);

  if (error) throw new Error('Error actualizando saldo de la factura');
};

module.exports = {
  getVentasPendientes,
  getEmpresaCredito,
  crearFactura,
  enlazarVentasAFactura,
  getCartera,
  getFacturaById,
  registrarCobro,
  actualizarSaldoFactura
};