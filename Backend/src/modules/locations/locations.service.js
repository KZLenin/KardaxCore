const repository = require('./locations.repository');

const registrarPais = async (datos) => {
  if (!datos.nombre || !datos.prefijo) throw new Error('Nombre y prefijo del país son obligatorios.');
  return await repository.crearPais({
    nombre: datos.nombre.trim(),
    prefijo: datos.prefijo.trim().toUpperCase()
  });
};

const registrarCiudad = async (datos) => {
  if (!datos.pais_id || !datos.nombre) throw new Error('ID del país y nombre de la ciudad son obligatorios.');
  return await repository.crearCiudad({
    pais_id: datos.pais_id,
    nombre: datos.nombre.trim()
  });
};

const registrarSede = async (datos) => {
  if (!datos.ciudad_id || !datos.nombre) throw new Error('ID de la ciudad y nombre de la sede son obligatorios.');
  return await repository.crearSede({
    ciudad_id: datos.ciudad_id,
    nombre: datos.nombre.trim(),
    direccion: datos.direccion ? datos.direccion.trim() : null
  });
};

module.exports = { registrarPais, registrarCiudad, registrarSede };