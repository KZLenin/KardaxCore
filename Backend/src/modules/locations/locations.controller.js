const service = require('./locations.service');

const crearPais = async (req, res) => {
  try {
    const nuevoPais = await service.registrarPais(req.body);
    res.status(201).json({ mensaje: 'País creado', data: nuevoPais });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const crearCiudad = async (req, res) => {
  try {
    const nuevaCiudad = await service.registrarCiudad(req.body);
    res.status(201).json({ mensaje: 'Ciudad creada', data: nuevaCiudad });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const crearSede = async (req, res) => {
  try {
    const nuevaSede = await service.registrarSede(req.body);
    res.status(201).json({ mensaje: 'Sede creada', data: nuevaSede });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPaises = async (req, res) => {
  try { res.status(200).json(await service.listarPaises()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

const getCiudades = async (req, res) => {
  try { res.status(200).json(await service.listarCiudades()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

const getSedes = async (req, res) => {
  try { res.status(200).json(await service.listarSedes()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
};

module.exports = { 
  crearPais, crearCiudad, crearSede, 
  getPaises, getCiudades, getSedes
};