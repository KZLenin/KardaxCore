const supabase = require('../../config/supabase'); // Ajusta la ruta si es necesario

// 1. Crear nueva orden y bloquear el equipo
const crearOrdenTrabajo = async (datosOrden) => {
  // Paso A: Insertar el ticket en la tabla nueva
  const { data: orden, error: errorOrden } = await supabase
    .from('ordenes_trabajo')
    .insert([datosOrden])
    .select()
    .single();

  if (errorOrden) throw new Error(`Error al crear la orden: ${errorOrden.message}`);

  // Paso B: Bloquear el equipo en el Kardex para que no lo vendan ni lo muevan
  const { error: errorEquipo } = await supabase
    .from('inventario')
    .update({ estado_operativo: 'En Mantenimiento' })
    .eq('id', datosOrden.item_id);

  if (errorEquipo) {
    console.error("Alerta: Orden creada, pero falló el bloqueo del equipo.", errorEquipo);
    // Nota: En un sistema estricto haríamos un Rollback aquí, pero por ahora lo dejamos como log.
  }

  return orden;
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

module.exports = {
  crearOrdenTrabajo,
  obtenerOrdenes,
};