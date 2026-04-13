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
    // 🔥 AQUÍ ESTÁ LA MAGIA CORREGIDA
    .select(`
      *,
      items:ventas_detalle (
        cantidad,
        precio_unitario,
        garantia_dias_cliente,
        item:inventario (nombre)
      )
    `)
    .eq('id', ventaId)
    .single();

  if (error) throw new Error(`Error BD Detalles Venta: ${error.message}`);

  // Formateamos la respuesta para el Frontend
  return {
    ...data,
    items: data.items.map(i => ({
      item_nombre: i.item?.nombre || 'Equipo desconocido',
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      garantia_dias: i.garantia_dias_cliente // Usamos el nombre real de tu columna
    }))
  };
};

module.exports = { crearCabeceraVenta, crearDetallesVenta, getHistorial, obtenerDetalleVenta };