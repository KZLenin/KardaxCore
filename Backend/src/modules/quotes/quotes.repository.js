const supabase = require('../../config/supabase');

const crearCotizacionBase = async (datos) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .insert([datos])
    .select()
    .single();

  if (error) throw new Error(`Error BD al crear cotización: ${error.message}`);
  return data;
};

const insertarDetallesCotizacion = async (arrayDetalles) => {
  const { data, error } = await supabase
    .from('cotizaciones_detalle')
    .insert(arrayDetalles)
    .select();

  if (error) throw new Error(`Error BD al insertar detalles: ${error.message}`);
  return data;
};

const actualizarEstadoCotizacion = async (id, estado) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar estado: ${error.message}`);
  return data;
};

const obtenerCotizaciones = async (filtros = {}) => {
  let query = supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes_empresas (nombre_comercial, identificacion)
    `)
    .order('fecha_emision', { ascending: false });

  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error BD al listar cotizaciones: ${error.message}`);
  return data;
};

const obtenerCotizacionConDetalles = async (id) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes_empresas (nombre_comercial, identificacion, email_facturacion, telefono),
      cotizaciones_detalle (
        id, cantidad, precio_unitario, estado_aprobacion,
        inventario (id, nombre, codigo_barras, imagen_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(`Error BD al obtener detalles de cotización: ${error.message}`);
  return data;
};

const actualizarCotizacionBase = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar cotización: ${error.message}`);
  return data;
};

const actualizarEstadoDetalles = async (idsAceptados, idsRechazados) => {
  if (idsAceptados.length > 0) {
    const { error: errAceptados } = await supabase
      .from('cotizaciones_detalle')
      .update({ estado_aprobacion: true })
      .in('id', idsAceptados);
    if (errAceptados) throw new Error('Error al aprobar detalles');
  }

  if (idsRechazados.length > 0) {
    const { error: errRechazados } = await supabase
      .from('cotizaciones_detalle')
      .update({ estado_aprobacion: false })
      .in('id', idsRechazados);
    if (errRechazados) throw new Error('Error al rechazar detalles');
  }
};

module.exports = {
  crearCotizacionBase,
  insertarDetallesCotizacion,
  actualizarEstadoCotizacion,
  obtenerCotizaciones,
  obtenerCotizacionConDetalles,
  actualizarCotizacionBase,
  actualizarEstadoDetalles
};