const service = require('./users.service');

const getRoles = async (req, res) => {
  try {
    const roles = await service.listarRoles();
    res.status(200).json(roles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await service.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await service.registrarUsuario(req.body);
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', data: nuevoUsuario });
  } catch (error) {
    console.error('[Error al crear usuario]:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getRoles,
  getUsuarios,
  crearUsuario
};