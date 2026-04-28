const maintenanceRepository = require('./maintenance.repository');
const inventoryRepository = require('../inventory/inventory.repository');
const sparepartsRepository = require('../spareparts/spareparts.repository');

const registrarOrden = async (datosOrden) => {
  // Validaciones de negocio antes de tocar la base de datos
  if (!datosOrden.item_id) throw new Error('El ID del equipo es obligatorio');
  if (!datosOrden.motivo) throw new Error('El motivo del mantenimiento es obligatorio');
  if (!datosOrden.tipo_mantenimiento) throw new Error('Debes especificar el tipo de mantenimiento');

  // Asegurarnos de que inicie con estado Pendiente
  const nuevaOrden = {
    ...datosOrden,
    estado: 'Ingresado', // Flujo: Ingresado -> En Diagnóstico -> Esperando Repuestos -> Listo
    fecha_creacion: new Date().toISOString()
  };

  // 2. Creamos la orden en la BD
  const ordenCreada = await maintenanceRepository.crearOrdenTrabajo(nuevaOrden);

  // 3. Bloqueamos el equipo en el Kardex
  await inventoryRepository.actualizarItem(datosOrden.item_id, { estado_operativo: 'En Mantenimiento' });
  
  // 4. Escribimos en el historial del equipo
  await inventoryRepository.registrarHistorial(
    datosOrden.item_id, 
    'INGRESO_TALLER', 
    `Ingresó a taller (${datosOrden.tipo_mantenimiento}). Motivo: ${datosOrden.motivo}`,
    datosOrden.creado_por || 'Sistema'
  );

  return ordenCreada;
};

const listarOrdenes = async () => {
  const ordenes = await maintenanceRepository.obtenerOrdenes();
  
  // 1. Mapeamos las órdenes y calculamos costos (Tu código actual)
  const ordenesFormateadas = await Promise.all(ordenes.map(async (orden) => {
    const repuestos = await sparepartsRepository.obtenerRepuestosPorOrden(orden.id);
    const totalRepuestos = repuestos.reduce((sum, r) => sum + (Number(r.costo_unitario) * r.cantidad), 0);

    return {
      id: orden.id,
      equipo_nombre: orden.inventario?.nombre || 'Equipo Desconocido',
      codigo_equipo: orden.inventario?.codigo_barras || 'S/N',
      tecnico: orden.perfiles_usuario?.nombre_completo || 'Sin asignar',
      tipo: orden.tipo_mantenimiento,
      estado: orden.estado,
      prioridad: orden.prioridad,
      motivo: orden.motivo,
      fecha: new Date(orden.fecha_creacion).toLocaleDateString(),
      item_id: orden.item_id, 
      diagnostico: orden.diagnostico,
      trabajo_realizado: orden.trabajo_realizado,
      costo_mano_obra: orden.costo_mano_obra,
      costo_repuestos: totalRepuestos,
      costo_total: totalRepuestos + (Number(orden.costo_mano_obra) || 0)
    };
  }));

  // 🔥 2. EL ALGORITMO SE MUDA AL BACKEND
  const ordenesOrdenadas = ordenesFormateadas.sort((a, b) => {
    const pesoEstado = {
      'Pendiente': 1, 'Ingresado': 1, 'En Revisión': 2, 
      'Finalizado': 3, 'Reparado': 3, 'Listo para Entrega': 3
    };
    const pesoPrioridad = {
      'Urgente': 1, 'Alta': 2, 'Media': 3, 'Baja': 4
    };

    const estadoA = pesoEstado[a.estado] || 2;
    const estadoB = pesoEstado[b.estado] || 2;

    if (estadoA !== estadoB) return estadoA - estadoB;

    const prioA = pesoPrioridad[a.prioridad] || 4;
    const prioB = pesoPrioridad[b.prioridad] || 4;

    return prioA - prioB;
  });

  // 3. Devolvemos el array ya digerido y ordenado
  return ordenesOrdenadas;
};

const actualizarOrden = async (id, datosActualizados, item_id, usuario_id) => {
  if (!id) throw new Error('El ID de la orden es obligatorio');
  
  let cambiarEstadoEquipo = false;

  // 🔥 Si el técnico lo marca como Reparado o Listo para Entrega
  if (['Reparado', 'Listo para Entrega', 'Finalizado'].includes(datosActualizados.estado)) {
    if (!datosActualizados.fecha_fin) datosActualizados.fecha_fin = new Date().toISOString();
    cambiarEstadoEquipo = true; 
  }

  // Actualizamos la orden de trabajo
  const ordenActualizada = await maintenanceRepository.actualizarOrdenTrabajo(id, datosActualizados);

  // 2. Si ya terminó, liberamos el equipo en el Kardex
  if (cambiarEstadoEquipo && item_id) {
    await inventoryRepository.actualizarItem(item_id, { estado_operativo: 'Operativo' });
    
    await inventoryRepository.registrarHistorial(
      item_id, 
      'SALIDA_TALLER', 
      `Reparación finalizada. Diagnóstico: ${datosActualizados.diagnostico || 'Sin detalles'}. Trabajo: ${datosActualizados.trabajo_realizado || 'N/A'}.`,
      usuario_id || 'Sistema'
    );
  }

  return ordenActualizada;
};

const lookupEquipoPorEscaneo = async (codigo) => {
  if (!codigo) throw new Error('El código escaneado es obligatorio');
  const equipo = await maintenanceRepository.buscarEquipoPorCodigo(codigo);
  
  if (!equipo) {
    throw new Error(`No se encontró ningún equipo con el código: ${codigo}`);
  }
  
  // Formateamos para el frontend
  return {
    id: equipo.id,
    nombre: equipo.nombre,
    codigo: equipo.codigo_barras,
    sede: equipo.sedes?.nombre || 'Sede N/A'
  };
};

module.exports = {
  registrarOrden,
  listarOrdenes, lookupEquipoPorEscaneo,
  actualizarOrden,
};  