const service = require('./movements.service');

const registrarMovimientoLogistico = async (req, res) => {

  try {
    // Asumimos que tu middleware de Auth inyecta los datos del usuario logueado en req.user
    // Si aún no lo hace, ponemos un ID temporal para probar
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ 
        error: "No se pudo identificar al responsable. Asegúrate de estar logueado." 
      });
    }

    const usuarioId = req.usuario.id;

    // Le pasamos el body y el ID del usuario al servicio
    const resultado = await service.crearMovimiento(req.body, usuarioId);
    
    res.status(201).json({ 
      mensaje: 'Movimiento registrado y Orden de Trabajo generada.', 
      data: resultado 
    });
  } catch (error) {
    console.error('[Error Movimientos]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const buscarPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const item = await service.buscarParaMovimiento(codigo);
    res.status(200).json(item);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getHistorialCompleto = async (req, res) => {
  try {
    // Aquí podrías filtrar por fecha o ítem en el futuro
    const historial = await service.listarTodoElHistorial(); 
    res.status(200).json(historial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registrarBaja = async (req, res) => {
  try {
    console.log("Cuerpo:", req.body);
    console.log("Archivo:", req.file);
    const { id } = req.params; // ID del equipo
    const { motivo, cantidadActual } = req.body;
    const file = req.file; // La foto atrapada por multer

    await service.registrarBajaConEvidencia(
      { itemId: id, motivo, cantidadActual: Number(cantidadActual) },
      file,
      req.usuario.id
    );

    res.status(200).json({ mensaje: 'Equipo dado de baja y evidencia guardada.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error("🚨 ERROR REAL EN EL BACKEND:", error);
  }
};
module.exports = { registrarMovimientoLogistico, buscarPorCodigo, getHistorialCompleto, registrarBaja };