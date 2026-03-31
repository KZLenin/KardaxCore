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

const registrarProveedor = async (datos) => {
  // Validamos al menos el nombre de la empresa antes de ir a la BD
  if (!datos.nombre_empresa) {
    throw new Error('El nombre de la empresa es obligatorio.');
  }
  
  // Pasamos los datos limpios al repositorio
  return await inventoryRepository.crearProveedor(datos);
};

const listarInventario = async (filtros) => {
  // 1. Llamamos a tu función obtenerInventario del repositorio
  const itemsBrutos = await inventoryRepository.obtenerInventario(filtros);

  // 2. Mapeamos los datos crudos a nombres que el Frontend entienda fácil
  return itemsBrutos.map(item => ({
    id: item.id,
    // Priorizamos código de barras, si no hay, la serie, si no, 'S/N'
    codigo: item.codigo_barras || item.serie_fabricante || 'S/N', 
    nombre: item.nombre,
    // Gracias al join de tu repositorio, aquí tenemos los nombres reales
    categoria: item.categorias?.nombre || 'Sin categoría',
    sede: item.sedes?.nombre || 'N/A',
    proveedor: item.proveedores?.nombre_empresa || 'N/A',
    // Usamos los nombres exactos de tu SQL
    stock: item.cantidad_stock, 
    unidad: item.unidad_medida,
    // Calculamos el estado dinámicamente aquí
    estado: item.cantidad_stock <= 2 ? 'Crítico' : 'Óptimo',
    detalles: item.detalles
  }));
};

const listarCategorias = async () => await inventoryRepository.obtenerCategorias();
const listarProveedores = async () => await inventoryRepository.obtenerProveedores();

module.exports = {
  registrarEntrada, registrarCategoria, registrarProveedor,
  listarCategorias, listarProveedores, listarInventario,
};