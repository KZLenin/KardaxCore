const inventoryService = require('./inventory.service');

const registrarEntrada = async (req, res, next) => {
  try {
    const datosItem = req.body;
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

module.exports = {
  registrarEntrada,
  crearCategoria,
};