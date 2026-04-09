const supabase = require('../../config/supabase'); // Ajusta la ruta si es necesario
const inventoryRepository = require('../inventory/inventory.repository');

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

  inventoryRepository.registrarHistorial(
    datosOrden.item_id, 
    'INGRESO_MANTENIMIENTO', 
    `Ingresó por orden de mantenimiento (${datosOrden.tipo_mantenimiento}). Motivo: ${datosOrden.motivo}`,
    datosOrden.creado_por // Aquí enviamos el ID del usuario que creó el ticket
  );

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

const actualizarOrdenTrabajo = async (id, datosActualizados, item_id) => {
  // Paso 1: Actualizamos la orden con lo que escribió el técnico
  const { data: orden, error: errorOrden } = await supabase
    .from('ordenes_trabajo')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (errorOrden) throw new Error(`Error al actualizar la orden: ${errorOrden.message}`);

  // Paso 2: LA REGLA DE NEGOCIO (Liberar el equipo si ya terminó)
  if (datosActualizados.estado === 'Finalizado' && item_id) {
    const { error: errorEquipo } = await supabase
      .from('inventario')
      .update({ estado_operativo: 'Operativo' })
      .eq('id', item_id);

    if (errorEquipo) {
      console.error("Alerta: Orden finalizada, pero falló el desbloqueo del equipo.", errorEquipo);
    }

    inventoryRepository.registrarHistorial(
      item_id, 
      'SALIDA_MANTENIMIENTO', 
      `Finalizó el mantenimiento. Diagnóstico: ${datosActualizados.diagnostico || 'Sin detalles'}. El equipo vuelve a estar Operativo.`,
      // Como aquí no siempre tenemos quién editó a la mano, 
      // idealmente deberías pasar el ID desde el controlador, o poner 'Técnico'
      'Usuario Técnico' 
    );
  }

  return orden;
};

const buscarEquipoPorCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('inventario')
    .select(`
      id, 
      nombre, 
      codigo_barras,
      sedes!inventario_sede_id_fkey (nombre) -- Traemos la sede para contexto visual
    `)
    .eq('codigo_barras', codigo)
    .single(); // Esperamos uno solo

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found, which we want to handle gracefully
    throw new Error(`Error al buscar equipo: ${error.message}`);
  }
  return data; // Si no lo encuentra, devolverá null
};

module.exports = {
  crearOrdenTrabajo,
  obtenerOrdenes, buscarEquipoPorCodigo,
  actualizarOrdenTrabajo,
};