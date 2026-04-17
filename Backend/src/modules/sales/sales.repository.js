const supabase = require('../../config/supabase');

const crearCabeceraVenta = async (datosVenta) => {
  const { data, error } = await supabase
    .from('ventas')
    .insert([datosVenta])
    .select()
    .single();

  if (error) throw new Error(`Error al crear la cabecera de venta: ${error.message}`);
  return data;
};

const crearDetallesVenta = async (detalles) => {
  // Insertamos un array completo de golpe (Bulk Insert)
  const { error } = await supabase
    .from('ventas_detalle')
    .insert(detalles);

  if (error) throw new Error(`Error al guardar los ítems de la venta: ${error.message}`);
};

const getHistorial = async (buscarTerm) => {
    let query = supabase
      .from('ventas')
      .select(`
        *,
        ventas_detalle ( cantidad ),
        empresa:clientes_empresas(nombre_comercial) -- 🔥 Traemos el nombre real del cliente
      `)
      .order('fecha_venta', { ascending: false });

    if (buscarTerm) {
      query = query.or(`cliente_nombre.ilike.%${buscarTerm}%,numero_comprobante.ilike.%${buscarTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    const historialMapeado = data.map(venta => ({
      ...venta,

      cliente_nombre: venta.empresa?.nombre_comercial || venta.cliente_nombre,
      total_items: venta.ventas_detalle.reduce((suma, item) => suma + item.cantidad, 0)
    }));

    return historialMapeado;
  }

  const obtenerDetalleVenta = async (ventaId) => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      empresa:clientes_empresas (nombre_comercial, ruc),
      sucursal:clientes_sucursales (
        nombre_sucursal, 
        direccion, 
        contacto_nombre, 
        telefono
      ),
      items:ventas_detalle (
        cantidad,
        precio_unitario,
        garantia_dias_cliente,
        item:inventario (nombre, codigo_barras)
      )
    `)
    .eq('id', ventaId)
    .single();

  if (error) throw new Error(`Error BD Detalles Venta: ${error.message}`);

  // Mapeo seguro usando solo las columnas que SI existen en tu BDD
  return {
    ...data,
    empresa_nombre: data.empresa?.nombre_comercial || data.cliente_nombre || 'N/A',
    sucursal_nombre: data.sucursal?.nombre_sucursal || 'Matriz Principal',
    direccion_envio: data.sucursal?.direccion || 'Dirección no registrada',
    contacto_entrega: data.sucursal?.contacto_nombre || 'S/N',
    ruc: data.empresa?.ruc || '',
    items: data.items.map(i => ({
      item_nombre: i.item?.nombre || 'Equipo desconocido',
      codigo: i.item?.codigo_barras || 'S/C',
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      garantia_dias: i.garantia_dias_cliente 
    }))
  };
};


const obtenerNombreEmpresa = async (empresaId) => {
  const { data, error } = await supabase
    .from('clientes_empresas')
    .select('nombre_comercial')
    .eq('id', empresaId)
    .single();
  if (error) return null;
  return data.nombre_comercial;
};

const obtenerDetalleSucursal = async (sucursalId) => {
  const { data, error } = await supabase
    .from('clientes_sucursales')
    .select('nombre_sucursal')
    .eq('id', sucursalId)
    .single();
  if (error) return null;
  return data; // Aquí devolvemos el objeto porque el service usa detalleSucursal.nombre_sucursal
};

module.exports = { crearCabeceraVenta, crearDetallesVenta, getHistorial, obtenerDetalleVenta, obtenerNombreEmpresa, obtenerDetalleSucursal };