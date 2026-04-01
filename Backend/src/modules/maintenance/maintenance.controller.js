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

// ⚠️ ATENCIÓN AQUÍ (Para tu función crearOrden que ya tienes):
// Como tu login está al 100%, asegúrate de que en crearOrden tengas esta línea:
// datosOrden.creado_por = req.usuario.id; // Asumiendo que tu middleware inyecta el usuario

module.exports = {
  crearOrden,
  getOrdenes,
};