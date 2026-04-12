const salesService = require('./sales.service');

const registrarVenta = async (req, res) => {
  try {
    const vendedorId = req.usuario?.id || 'Sistema'; // Viene de tu middleware auth
    
    const resultado = await salesService.procesarVentaB2B(req.body, vendedorId);
    
    res.status(201).json({ 
      mensaje: 'Venta completada y stock actualizado exitosamente.', 
      data: resultado 
    });
  } catch (error) {
    console.error('🚨 ERROR EN VENTA:', error);
    res.status(400).json({ error: error.message });
  }
};

const getHistorialVentas = async (req, res) => {
  try {
    // Mandamos los query params (ej. ?buscar=SmartFit) al servicio
    const data = await salesService.obtenerHistorial(req.query);
    
    // Respondemos con éxito
    res.status(200).json(data);
  } catch (error) {
    console.error("🚨 Error en getHistorialVentas:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
module.exports = { registrarVenta, getHistorialVentas };