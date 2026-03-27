const inventoryRepository = require('./inventory.repository');
// const hardwareService = require('../hardware/services/cromePrinter'); // Lo usaremos después

const registrarEntrada = async (datos) => {
  if (!datos.sedeId || !datos.categoriaId || !datos.nombre) {
    throw new Error('Faltan datos obligatorios para registrar el ítem en el Kardex.');
  }
  const datosLimpios = {
    ...datos,
    nombre: datos.nombre.trim().toUpperCase(),
  };
  const nuevoItem = await inventoryRepository.crearItemKardex(datosLimpios);

  // 3. (Futuro) Aquí mandaríamos a imprimir a la Crome usando el hardwareService
  // await hardwareService.imprimirEtiqueta(nuevoItem.codigo_barras, nuevoItem.nombre);

  return nuevoItem;
};

const registrarCategoria = async (datos) => {
  if (!datos.nombre || !datos.prefijo) throw new Error('Nombre y prefijo son obligatorios.');
  return await inventoryRepository.crearCategoria({
    nombre: datos.nombre.trim(),
    prefijo: datos.prefijo.trim().toUpperCase()
  });
};

module.exports = {
  registrarEntrada,
  registrarCategoria
};