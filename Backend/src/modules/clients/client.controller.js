const service = require('./client.service');

// --- CONTROLADORES DE EMPRESA ---
const getEmpresas = async (req, res) => {
  try {
    const clientes = await service.listarEmpresas();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const crearEmpresa = async (req, res) => {
  try {
    const nuevaEmpresa = await service.registrarEmpresa(req.body);
    res.status(201).json({ mensaje: 'Empresa creada exitosamente', data: nuevaEmpresa });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await service.actualizarEmpresa(id, req.body);
    res.status(200).json({ mensaje: 'Empresa actualizada', data: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --- CONTROLADORES DE SUCURSAL ---
const crearSucursal = async (req, res) => {
  try {
    const { empresaId } = req.params; // Sacamos el ID de la empresa de la URL
    const nuevaSucursal = await service.registrarSucursal(empresaId, req.body);
    res.status(201).json({ mensaje: 'Sucursal creada exitosamente', data: nuevaSucursal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editarSucursal = async (req, res) => {
  try {
    const { idSucursal } = req.params;
    const resultado = await service.actualizarSucursal(idSucursal, req.body);
    res.status(200).json({ mensaje: 'Sucursal actualizada', data: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSucursales = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const sucursales = await service.listarSucursales(empresaId);
    res.status(200).json(sucursales);
  } catch (error) {
    console.error("🚨 ERROR REAL EN LA BD:", error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEmpresas, getSucursales,
  crearEmpresa, crearSucursal,
  editarEmpresa, editarSucursal,
};