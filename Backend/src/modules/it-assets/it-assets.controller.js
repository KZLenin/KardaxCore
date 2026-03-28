const itAssetsService = require('./it-assets.service');

const registrarEquipo = async (req, res) => {
  try {
    // Le pasamos la orden al servicio
    const equipo = await itAssetsService.registrarFichaTI(req.body);
    
    res.status(201).json({ 
      mensaje: 'Ficha técnica de TI registrada exitosamente', 
      data: equipo 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarEquipos = async (req, res) => {
  try {
    // Pedimos la lista al servicio
    const equipos = await itAssetsService.obtenerTodosLosEquipos();
    
    res.status(200).json({
      total: equipos.length,
      data: equipos
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registrarEquipo, listarEquipos };