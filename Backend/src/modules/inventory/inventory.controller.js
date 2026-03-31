const inventoryService = require('./inventory.service');

const registrarEntrada = async (req, res, next) => {
  try {
    const datosItem = req.body;
    datosItem.sedeId = req.usuario.sedeId || req.body.sedeId;
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
      buscar: req.query.buscar
    };

    const inventario = await inventoryService.listarInventario(filtros);
    res.status(200).json(inventario);
  } catch (error) {
    console.error('[Error en Controlador de Inventario]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registrarEntrada, crearCategoria, registrarProveedor,
  getCategorias, getProveedores, getInventario,
};