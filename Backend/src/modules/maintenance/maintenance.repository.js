const supabase = require('../../config/supabase'); 

const crearOrdenTrabajo = async (datosOrden) => {
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .insert([datosOrden])
    .select()
    .single();

  if (error) throw new Error(`Error al crear la orden: ${error.message}`);
  return data;
};

const obtenerOrdenes = async () => {
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      inventario (nombre, codigo_barras),
      perfiles_usuario!fk_orden_tecnico (nombre_completo) 
    `)
    .order('fecha_creacion', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const actualizarOrdenTrabajo = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar la orden: ${error.message}`);
  return data;
};

const buscarEquipoPorCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('inventario')
    .select(`
      id, nombre, codigo_barras,
      sedes!inventario_sede_id_fkey (nombre)
    `)
    .eq('codigo_barras', codigo)
    .single(); 

  if (error && error.code !== 'PGRST116') { 
    throw new Error(`Error al buscar equipo: ${error.message}`);
  }
  return data; 
};

module.exports = { crearOrdenTrabajo, obtenerOrdenes, actualizarOrdenTrabajo, buscarEquipoPorCodigo };