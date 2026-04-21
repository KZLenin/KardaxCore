const { get } = require('./maintenance.routes');
const maintenanceService = require('./maintenance.service');
const supabase = require('../../config/supabase');

const crearOrden = async (req, res) => {
  console.log("=== REVISIÓN DE ENTRADA ===");
  console.log("BODY:", req.body); // Aquí deberían verse el motivo, prioridad, etc.
  console.log("FILE:", req.file); // <--- SI ESTO SALE 'UNDEFINED', EL PROBLEMA ES EL FRONTEND
  console.log("FILES (Plural):", req.files);
  console.log("===========================");
  try {
    // Extraemos los datos del body (lo que envía React)
    const datosOrden = req.body;
    
    // Si tienes middleware de autenticación, aquí agarrarías quién lo creó
    datosOrden.creado_por = req.usuario.id; 

    if (req.file) {
      // 1. Limpiamos el nombre para evitar errores en URLs
      const extension = req.file.originalname.split('.').pop();
      const nombreLimpio = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

      // 2. Subimos el buffer de memoria directo a Supabase
      const { error: uploadError } = await supabase.storage
        .from('tickets-evidencia')
        .upload(nombreLimpio, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw new Error(`Error al subir la evidencia: ${uploadError.message}`);

      // 3. Obtenemos el link público
      const { data: publicUrlData } = supabase.storage
        .from('tickets-evidencia')
        .getPublicUrl(nombreLimpio);

      // 4. Se lo agregamos a los datos que van a la Base de Datos
      datosOrden.foto_ingreso = publicUrlData.publicUrl;
    }

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

    const { item_id } = req.body;
    const usuario_id = req.usuario.id; 

    const ordenActualizada = await maintenanceService.actualizarOrden(id, datosActualizados, item_id, usuario_id);

    res.status(200).json({
      mensaje: 'Orden actualizada correctamente',
      data: ordenActualizada
    });
  } catch (error) {
    console.error('🚨 ERROR AL ACTUALIZAR ORDEN:', error);
    res.status(400).json({ error: error.message });
  }
};

const getEquipoScanner = async (req, res) => {
  try {
    const { codigo } = req.params;
    const equipo = await maintenanceService.lookupEquipoPorEscaneo(codigo);
    res.status(200).json(equipo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  crearOrden,
  getOrdenes, getEquipoScanner,
  actualizarOrden,
};