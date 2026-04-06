const maintenanceRepository = require('./maintenance.repository');

const registrarOrden = async (datosOrden) => {
  // Validaciones de negocio antes de tocar la base de datos
  if (!datosOrden.item_id) throw new Error('El ID del equipo es obligatorio');
  if (!datosOrden.motivo) throw new Error('El motivo del mantenimiento es obligatorio');
  if (!datosOrden.tipo_mantenimiento) throw new Error('Debes especificar el tipo de mantenimiento');

  // Asegurarnos de que inicie con estado Pendiente
  const nuevaOrden = {
    ...datosOrden,
    estado: 'Pendiente',
    fecha_creacion: new Date().toISOString()
  };

  return await maintenanceRepository.crearOrdenTrabajo(nuevaOrden);
};

const listarOrdenes = async () => {
  const ordenes = await maintenanceRepository.obtenerOrdenes();
  // Formateamos para el frontend
  return ordenes.map(orden => ({
    id: orden.id,
    equipo_nombre: orden.inventario?.nombre || 'Equipo Desconocido',
    codigo_equipo: orden.inventario?.codigo_barras || 'S/N',
    tecnico: orden.perfiles_usuario?.nombre_completo || 'Sin asignar',
    tipo: orden.tipo_mantenimiento,
    estado: orden.estado,
    prioridad: orden.prioridad,
    motivo: orden.motivo,
    fecha: new Date(orden.fecha_creacion).toLocaleDateString(),

    item_id: orden.item_id, // Vital para saber a quién desbloquear
    diagnostico: orden.diagnostico,
    trabajo_realizado: orden.trabajo_realizado,
    costo_mano_obra: orden.costo_mano_obra,
    costo_repuestos: orden.costo_repuestos
  }));
};

const actualizarOrden = async (id, datosActualizados, item_id) => {
  if (!id) throw new Error('El ID de la orden es obligatorio');
  
  // Si envían que está finalizado, le ponemos fecha de fin automática
  if (datosActualizados.estado === 'Finalizado' && !datosActualizados.fecha_fin) {
    datosActualizados.fecha_fin = new Date().toISOString();
  }

  return await maintenanceRepository.actualizarOrdenTrabajo(id, datosActualizados, item_id);
};

module.exports = {
  registrarOrden,
  listarOrdenes,
  actualizarOrden,
};  