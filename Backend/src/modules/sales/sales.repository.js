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
    // 1. Hacemos un JOIN con ventas_detalle usando la sintaxis de Supabase
    let query = supabase
      .from('ventas')
      .select(`
        *,
        ventas_detalle ( cantidad )
      `)
      .order('fecha_venta', { ascending: false }); // Tu columna real

    if (buscarTerm) {
      query = query.or(`cliente_nombre.ilike.%${buscarTerm}%,numero_comprobante.ilike.%${buscarTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // 2. Mapeamos los resultados para sumar cuántos equipos tiene cada venta
    const historialMapeado = data.map(venta => ({
      ...venta,
      // Reduce suma todas las "cantidades" del array de ventas_detalle
      total_items: venta.ventas_detalle.reduce((suma, item) => suma + item.cantidad, 0)
    }));

    return historialMapeado;
  }

module.exports = { crearCabeceraVenta, crearDetallesVenta, getHistorial };