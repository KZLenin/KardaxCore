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

const actualizarPais = async (id, datos) => {
  if (!id) throw new Error('El ID del país es obligatorio.');
  
  const datosLimpios = { ...datos };
  if (datosLimpios.nombre) datosLimpios.nombre = datosLimpios.nombre.trim();
  if (datosLimpios.prefijo) datosLimpios.prefijo = datosLimpios.prefijo.trim().toUpperCase();

  return await repository.actualizarPais(id, datosLimpios);
};

const actualizarCiudad = async (id, datos) => {
  if (!id) throw new Error('El ID de la ciudad es obligatorio.');
  
  const datosLimpios = { ...datos };
  if (datosLimpios.nombre) datosLimpios.nombre = datosLimpios.nombre.trim();

  return await repository.actualizarCiudad(id, datosLimpios);
};

const actualizarSede = async (id, datos) => {
  if (!id) throw new Error('El ID de la sede es obligatorio.');
  
  const datosLimpios = { ...datos };
  if (datosLimpios.nombre) datosLimpios.nombre = datosLimpios.nombre.trim();
  if (datosLimpios.direccion) datosLimpios.direccion = datosLimpios.direccion.trim();

  return await repository.actualizarSede(id, datosLimpios);
};

const listarPaises = async () => await repository.obtenerPaises();
const listarCiudades = async () => await repository.obtenerCiudades();
const listarSedes = async () => await repository.obtenerSedes();

module.exports = { 
  registrarPais, registrarCiudad, registrarSede,
  listarPaises, listarCiudades, listarSedes,
  actualizarPais, actualizarCiudad, actualizarSede,
};