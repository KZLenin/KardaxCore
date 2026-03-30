const service = require('./movements.service');

const registrarMovimientoLogistico = async (req, res) => {
  try {
    // Asumimos que tu middleware de Auth inyecta los datos del usuario logueado en req.user
    // Si aún no lo hace, ponemos un ID temporal para probar
    const usuarioId = req.user ? req.user.id : 'ID_DEL_USUARIO_ADMIN_DE_PRUEBA';

    // Le pasamos el body y el ID del usuario al servicio
    const resultado = await service.crearMovimiento(req.body, usuarioId);
    
    res.status(201).json({ 
      mensaje: 'Movimiento registrado. Stock actualizado e historial guardado.', 
      data: resultado 
    });
  } catch (error) {
    console.error('[Error Movimientos]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registrarMovimientoLogistico };