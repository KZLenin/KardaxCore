const service = require('./movements.service');

const registrarMovimientoLogistico = async (req, res) => {
  try {
    const resultado = await service.crearMovimiento(req.body);
    
    res.status(201).json({ 
      mensaje: 'Movimiento registrado con éxito. Imprimiendo etiqueta de logística...', 
      data: resultado 
    });
  } catch (error) {
    console.error('[Error Movimientos]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registrarMovimientoLogistico };