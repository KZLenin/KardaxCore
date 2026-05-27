const service = require('./configuration.service');

const getGeneral = async (req, res) => {
  try {
    const config = await service.obtenerGeneral();
    res.status(200).json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePerfil = async (req, res) => {
  try {
    const data = await service.actualizarPerfil(req.body);
    res.status(200).json({ mensaje: 'Perfil actualizado correctamente', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateInventario = async (req, res) => {
  try {
    const data = await service.actualizarInventario(req.body);
    res.status(200).json({ mensaje: 'Parámetros de inventario guardados', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    const data = await service.actualizarLogo(req.file);
    res.status(200).json({ mensaje: 'Logo actualizado con éxito', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getGeneral,
  updatePerfil,
  updateInventario,
  uploadLogo
};