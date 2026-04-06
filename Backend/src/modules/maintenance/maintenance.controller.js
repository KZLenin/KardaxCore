const { get } = require('./maintenance.routes');
const maintenanceService = require('./maintenance.service');

const crearOrden = async (req, res) => {
  try {
    // Extraemos los datos del body (lo que envía React)
    const datosOrden = req.body;
    
    // Si tienes middleware de autenticación, aquí agarrarías quién lo creó
    datosOrden.creado_por = req.usuario.id; 

    const nuevaOrden = await maintenanceService.registrarOrden(datosOrden);

    res.status(201).json({
      mensaje: 'Orden de trabajo registrada y equipo bloqueado con éxito',
      data: nuevaOrden
    });
  } catch (error) {
    console.error('🚨 ERROR AL CREAR ORDEN:', error);
    res.status(400).json({ error: error.message });
  }
};

const getOrdenes = async (req, res) => {
  try {
    const ordenes = await maintenanceService.listarOrdenes();
    res.status(200).json(ordenes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    // Extraemos el item_id que debe venir desde el frontend para saber a quién desbloquear
    const { item_id } = req.body; 

    const ordenActualizada = await maintenanceService.actualizarOrden(id, datosActualizados, item_id);

    res.status(200).json({
      mensaje: 'Orden actualizada correctamente',
      data: ordenActualizada
    });
  } catch (error) {
    console.error('🚨 ERROR AL ACTUALIZAR ORDEN:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  crearOrden,
  getOrdenes,
  actualizarOrden,
};