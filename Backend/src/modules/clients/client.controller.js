const service = require('./client.service');

const getClientes = async (req, res) => {
  try {
    const clientes = await service.listarClientes();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const crearCliente = async (req, res) => {
  try {
    const nuevoCliente = await service.registrarCliente(req.body);
    res.status(201).json({ mensaje: 'Cliente creado exitosamente', data: nuevoCliente });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params; // Este es el ID de la empresa
    const resultado = await service.actualizarCliente(id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getClientes,
  crearCliente,
  actualizarCliente
};