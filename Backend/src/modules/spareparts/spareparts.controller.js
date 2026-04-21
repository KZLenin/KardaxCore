const sparepartsService = require('./spareparts.service');

const agregarRepuesto = async (req, res) => {
  try {
    const { ordenId } = req.params; // Viene de la URL
    const { item_id, cantidad } = req.body; // Vienen del formulario
    const usuario_id = req.usuario.id; // Viene del token de auth

    const resultado = await sparepartsService.consumirRepuestoEnOrden(
      ordenId, 
      item_id, 
      Number(cantidad), 
      usuario_id
    );

    res.status(201).json({
      mensaje: 'Repuesto consumido y stock actualizado correctamente.',
      data: resultado
    });
  } catch (error) {
    console.error('🚨 ERROR AL CONSUMIR REPUESTO:', error);
    res.status(400).json({ error: error.message });
  }
};

const getRepuestosPorOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const repuestos = await sparepartsService.listarRepuestosDeOrden(ordenId);
    res.status(200).json(repuestos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  agregarRepuesto,
  getRepuestosPorOrden
};