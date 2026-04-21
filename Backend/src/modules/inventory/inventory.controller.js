const { get } = require('./inventory.routes');
const inventoryService = require('./inventory.service');
const { generarPdfEtiquetas, generarPdfEtiquetasMasivo } = require('../../utils/barcodeGenerator'); // Ajusta la ruta a donde guardaste el archivo

const registrarEntrada = async (req, res, next) => {
  try {
    const datosItem = req.body;
    datosItem.sedeId = req.body.sedeId || req.usuario.sedeId; 
    datosItem.creadoPor = req.usuario.id;

    const nuevoItem = await inventoryService.registrarEntrada(datosItem);

    res.status(201).json({
      mensaje: 'Ítem registrado correctamente en el Kardex',
      item: nuevoItem
    });

  } catch (error) {
    console.error('[Error en Controlador de Inventario]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const nuevaCategoria = await inventoryService.registrarCategoria(req.body);
    res.status(201).json({ mensaje: 'Categoría creada', data: nuevaCategoria });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategorias = async (req, res) => {
  try { res.status(200).json(await inventoryService.listarCategorias()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

const getProveedores = async (req, res) => {
  try { res.status(200).json(await inventoryService.listarProveedores()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

const registrarProveedor = async (req, res) => {
  try {
    const nuevoProveedor = await inventoryService.registrarProveedor(req.body);
    res.status(201).json({ mensaje: 'Proveedor creado', data: nuevoProveedor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInventario = async (req, res) => {
  try {
    const filtros = {
      categoriaId: req.query.categoriaId,
      sedeId: req.query.sedeId,
      proveedorId: req.query.proveedorId,
      buscar: req.query.buscar,
      es_externo: req.query.es_externo
    };

    const inventario = await inventoryService.listarInventario(filtros);
    res.status(200).json(inventario);
  } catch (error) {
    console.error('[Error en Controlador de Inventario]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔥 AÑADIMOS LOS 3 CAMPOS NUEVOS A LA EXTRACCIÓN
    const { 
      nombre, categoria_id, proveedor_id, serie_fabricante, codigo_barras,
      es_externo, cliente_id, sucursal_id,notas_ingreso 
    } = req.body;

    const datosLimpios = {
      nombre,
      cat_id: categoria_id || null,
      proveedor_id: proveedor_id || null,
      serie_fabricante: serie_fabricante || null, 
      codigo_barras: codigo_barras || null,
      es_externo: es_externo || false,
      cliente_id: cliente_id || null,
      sucursal_id: sucursal_id || null,
      notas_ingreso: notas_ingreso || null
    };
    
    const equipoActualizado = await inventoryService.actualizarEquipo(id, datosLimpios);
    res.status(200).json({ mensaje: 'Equipo actualizado', data: equipoActualizado });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHistorial = async (req, res) => {
  try {
    const { id } = req.params; // Este es el ID del equipo
    const historial = await inventoryService.obtenerHistorial(id);
    res.status(200).json(historial);
  } catch (error) {
    console.error('[Error en Historial]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const descargarEtiquetas = async (req, res) => {
  try {
    const { id } = req.params;
    const cantidad = parseInt(req.query.cantidad) || 1; // Si no mandan cantidad, imprimimos 1 por defecto

    // 1. Buscamos los datos reales del equipo
    const equipo = await inventoryService.obtenerEquipoPorId(id); // <--- Ajusta al nombre real de tu función
    if (!equipo) throw new Error("Equipo no encontrado");

    // 2. Llamamos al motor V8
    const pdfBuffer = await generarPdfEtiquetas(equipo.codigo_barras, equipo.nombre, cantidad);

    // 3. Le decimos al navegador: "¡Oye, prepárate que te envío un archivo PDF!"
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=etiquetas_${equipo.codigo_barras}.pdf`);
    
    // 4. Enviamos el archivo crudo
    res.send(pdfBuffer);

  } catch (error) {
    console.error('🚨 ERROR AL GENERAR ETIQUETAS:', error);
    res.status(500).json({ error: 'Error al generar las etiquetas' });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaActualizada = await inventoryService.actualizarCategoria(id, req.body);
    res.status(200).json({ mensaje: 'Categoría actualizada exitosamente', data: categoriaActualizada });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedorActualizado = await inventoryService.actualizarProveedor(id, req.body);
    res.status(200).json({ mensaje: 'Proveedor actualizado exitosamente', data: proveedorActualizado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSedes = async (req, res) => {
  try { res.status(200).json(await inventoryService.listarSedes()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

const descargarEtiquetasMasivas = async (req, res) => {
  try {
    const { ids } = req.body; 
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No se enviaron equipos para imprimir' });
    }

    const equiposValidos = [];

    // 🔥 FIX: Bucle seguro. Si un equipo falla (ej. no tiene código), el "catch" interno 
    // lo atrapa en silencio y el bucle sigue con el próximo equipo sin tumbar el servidor.
    for (const id of ids) {
      try {
        const equipo = await inventoryService.obtenerEquipoPorId(id);
        
        // Mapeamos los datos con los nombres EXACTOS que espera el motor PDF
        if (equipo && equipo.codigo_barras) {
          equiposValidos.push({
            codigo: equipo.codigo_barras,
            nombreEquipo: equipo.nombre
          });
        }
      } catch (itemError) {
        // Solo avisamos por consola interna, pero NO detenemos la impresión de los demás
        console.log(`⚠️ Equipo omitido en lote (ID: ${id}): ${itemError.message}`);
      }
    }

    // Si después de revisar todos, resulta que NINGUNO tenía código de barras:
    if (equiposValidos.length === 0) {
      return res.status(400).json({ 
        error: 'Ninguno de los equipos seleccionados tiene un código de barras asignado para imprimir.' 
      });
    }

    // 3. Llamamos al motor V8 con los que sí sobrevivieron
    const pdfBuffer = await generarPdfEtiquetasMasivo(equiposValidos);

    // 4. Enviamos el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="etiquetas_lote_${Date.now()}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('🚨 ERROR AL GENERAR ETIQUETAS MASIVAS:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor al generar etiquetas' });
    }
  }
};

const subirImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file; // 🔥 Multer inyecta el archivo aquí

    const imagenUrl = await inventoryService.subirImagenEquipo(id, file);

    res.status(200).json({ 
      mensaje: 'Imagen subida y enlazada correctamente', 
      imagen_url: imagenUrl 
    });
  } catch (error) {
    console.error('[Error al subir imagen]:', error.message);
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  registrarEntrada, crearCategoria, registrarProveedor, subirImagen,
  getCategorias, getProveedores, getInventario, getHistorial, getSedes,
  actualizarEquipo, actualizarCategoria, actualizarProveedor,
  descargarEtiquetas, descargarEtiquetasMasivas,
};