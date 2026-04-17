const inventoryRepository = require('./inventory.repository');
// const hardwareService = require('../hardware/services/cromePrinter'); // Lo usaremos después

const registrarEntrada = async (datos) => {
  if (!datos.sedeId || !datos.categoriaId || !datos.nombre) {
    throw new Error('Faltan datos obligatorios para registrar el ítem en el Kardex.');
  }

  const serieLimpia = (!datos.serie_fabricante || datos.serie_fabricante.trim() === '' || datos.serie_fabricante === '0') 
    ? null 
    : datos.serie_fabricante.trim();

  let cantidadFinal = Number(datos.cantidad_stock) || 0;
  const unidadTexto = datos.unidad_medida ? datos.unidad_medida.toUpperCase() : '';

  if (unidadTexto === 'UNIDAD' || unidadTexto === 'U') {
    cantidadFinal = 1; // Lo forzamos a 1
  }
  
  const datosLimpios = {
    ...datos,
    nombre: datos.nombre.trim().toUpperCase(),
    serie_fabricante: serieLimpia,
    cantidad_stock: cantidadFinal
  };
  const nuevoItem = await inventoryRepository.crearItemKardex(datosLimpios);


  return nuevoItem;
};

const actualizarCategoria = async (id, datos) => {
  if (!id) throw new Error('El ID de la categoría es obligatorio.');
  
  const datosLimpios = {};
  if (datos.nombre) datosLimpios.nombre = datos.nombre.trim();
  if (datos.prefijo) datosLimpios.prefijo = datos.prefijo.trim().toUpperCase();
  
  // Si el frontend envía el dato del padre, lo actualizamos también
  if (datos.categoria_padre_id !== undefined || datos.categoriaPadreId !== undefined) {
    datosLimpios.categoria_padre_id = datos.categoria_padre_id || datos.categoriaPadreId || null;
  }

  return await inventoryRepository.actualizarCategoria(id, datosLimpios);
};

const actualizarProveedor = async (id, datos) => {
  if (!id) throw new Error('El ID del proveedor es obligatorio.');
  return await inventoryRepository.actualizarProveedor(id, datos);
};

const registrarCategoria = async (datos) => {
  if (!datos.nombre || !datos.prefijo) throw new Error('Nombre y prefijo son obligatorios.');
  
  // Atrapamos el ID del padre (puede venir null si es una categoría principal)
  const categoriaPadreId = datos.categoria_padre_id || datos.categoriaPadreId || null;

  return await inventoryRepository.crearCategoria({
    nombre: datos.nombre.trim(),
    prefijo: datos.prefijo.trim().toUpperCase(),
    categoria_padre_id: categoriaPadreId // Lo mandamos a Supabase
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
    estado_operativo: item.estado_operativo || 'Operativo',
    
    // Tu antigua variable 'estado' la renombramos a 'nivel_stock' para no perder esa advertencia
    nivel_stock: item.cantidad_stock <= 2 ? 'Crítico' : 'Óptimo',
    
    detalles: item.detalles,

    cat_id: item.cat_id,
    prov_id: item.prov_id || item.proveedor_id, 
    serie_fabricante: item.serie_fabricante,
    codigo_barras: item.codigo_barras
  }));
};

const listarCategorias = async () => await inventoryRepository.obtenerCategorias();
const listarProveedores = async () => await inventoryRepository.obtenerProveedores();

const actualizarEquipo = async (id, datosActualizados) => {
  // Aquí podrías validar cosas de negocio (ej. que no cambien a una categoría inactiva)
  // Como no hay reglas complejas ahora, pasamos directo al repo:
  return await inventoryRepository.actualizarItem(id, datosActualizados);
};

const obtenerHistorial = async (itemId) => {
  if (!itemId) throw new Error('El ID del equipo es obligatorio');
  
  const historial = await inventoryRepository.obtenerHistorialItem(itemId);
  
  // Formateamos la fecha para que el Frontend no sufra
  return historial.map(evento => ({
    ...evento,
    fecha_formateada: new Date(evento.fecha_registro).toLocaleString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }));
};

const obtenerEquipoPorId = async (id) => {
  if (!id) throw new Error('El ID del equipo es obligatorio');
  
  const equipo = await inventoryRepository.obtenerItemPorId(id);
  if (!equipo) throw new Error('Equipo no encontrado');
  
  // Si el equipo no tiene código de barras, no podemos imprimir nada
  if (!equipo.codigo_barras) throw new Error('Este equipo no tiene un código de barras asignado');
  
  return equipo;
};

const listarSedes = async () => await inventoryRepository.obtenerSedes();

module.exports = {
  registrarEntrada, registrarCategoria, registrarProveedor,
  listarCategorias, listarProveedores, listarInventario, obtenerHistorial, obtenerEquipoPorId, listarSedes,
  actualizarEquipo, actualizarCategoria, actualizarProveedor,
};