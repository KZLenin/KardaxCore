const inventoryRepository = require('./inventory.repository');
const { generarExcelGenerico } = require('../../utils/excelGenerator');

const registrarEntrada = async (datos) => {
  // 1. Validaciones obligatorias
  if (!datos.sedeId || !datos.categoriaId || !datos.nombre) {
    throw new Error('Faltan datos obligatorios para registrar el ítem en el Kardex.');
  }

  const serieLimpia = (!datos.serieFabricante || datos.serieFabricante.trim() === '' || datos.serieFabricante === '0') 
    ? null 
    : datos.serieFabricante.trim();

  // 2. Evaluamos si es de Taller o Propio
  const esExterno = datos.es_externo === true || datos.es_externo === 'true';
  const clienteFinal = esExterno ? datos.clienteId : null;
  const sucursalFinal = esExterno ? datos.sucursalId : null;
  const proveedorFinal = esExterno ? null : datos.proveedorId;

  // 3. Atrapamos las cantidades que vienen del frontend (OJO: en camelCase)
 const cantidadIngresada = Number(datos.cantidad_stock || datos.cantidadStock) || 1;
  const unidadTexto = (datos.unidad_medida || datos.unidadMedida || '').toUpperCase();

  // 4. 🔥 LA MAGIA MULTIPLICADORA
  const esUnidad = unidadTexto === 'UNIDAD' || unidadTexto === 'U';
  
  // Si es Unidad y NO es de un cliente (porque los de cliente entran 1 a 1), multiplicamos
  const copiasACrear = (esUnidad && !esExterno) ? cantidadIngresada : 1;
  const stockPorFila = esUnidad ? 1 : cantidadIngresada;

  // 5. 🛡️ BLINDAJE ANTI-CRASH (Evitar duplicados de serie)
  if (copiasACrear > 1 && serieLimpia !== null) {
    throw new Error('No puedes clonar múltiples equipos a la vez si les pones un Número de Serie. Deja la serie en blanco o regístralos 1 por 1.');
  }

  const itemsCreados = [];

  // 6. 🔄 EL BUCLE CLONADOR
  for (let i = 0; i < copiasACrear; i++) {
    const datosLimpios = {
      ...datos,
      nombre: datos.nombre.trim().toUpperCase(),
      serie_fabricante: serieLimpia,
      cantidad_stock: stockPorFila, // Aquí lo pasamos a snake_case para la BD
      unidad_medida: unidadTexto,
      proveedorId: proveedorFinal,
      es_externo: esExterno,
      cliente_id: clienteFinal,
      sucursal_id: sucursalFinal,
      notas_ingreso: esExterno ? datos.notasIngreso : null
    };

    // A. Nace el equipo en el inventario (El Trigger le da su código único)
    const nuevoItem = await inventoryRepository.crearItemKardex(datosLimpios);

    // B. Registramos el Historial
    const descripcionHistorial = esExterno
      ? `Ingreso de equipo de CLIENTE a Taller. Notas: ${datos.notasIngreso || 'Ninguna'}`
      : `Ingreso inicial a BODEGA. Stock inicial: ${stockPorFila} ${unidadTexto}`;

    await inventoryRepository.registrarHistorial(
      nuevoItem.id,                 
      'INGRESO_SISTEMA',            
      descripcionHistorial,         
      datos.creadoPor || 'Sistema' 
    );

    // C. Registramos el Movimiento Logístico
    await inventoryRepository.registrarMovimiento({
      item_id: nuevoItem.id,
      tipo_movimiento: 'ENTRADA',
      cantidad: stockPorFila,
      sede_destino_id: datos.sedeId,
      usuario_id: datos.creadoPor || null, 
      observaciones: esExterno ? 'Recepción de equipo de cliente' : 'Ingreso de inventario propio'
    });

    itemsCreados.push(nuevoItem);
  }

  // 7. Devolvemos la lista de ítems creados
  return itemsCreados;
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
    proveedor: item.es_externo 
      ? `${item.clientes_empresas?.nombre_comercial || 'Desconocido'} - Sede: ${item.clientes_sucursales?.nombre_sucursal || 'Matriz'}` 
      : (item.proveedores?.nombre_empresa || 'N/A'),
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
    codigo_barras: item.codigo_barras,
    es_externo: item.es_externo,
    cliente_id: item.cliente_id,
    sucursal_id: item.sucursal_id,
    notas_ingreso: item.notas_ingreso
  }));
};

const listarCategorias = async () => await inventoryRepository.obtenerCategorias();
const listarProveedores = async () => await inventoryRepository.obtenerProveedores();

const actualizarEquipo = async (id, datosActualizados) => {
  if (!id) throw new Error('El ID del equipo es obligatorio para actualizar.');
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

const subirImagenEquipo = async (itemId, file) => {
  if (!itemId) throw new Error('El ID del equipo es obligatorio.');
  if (!file) throw new Error('No se detectó ninguna imagen en la petición.');

  // 1. Blindaje: Solo aceptamos imágenes
  const formatosValidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!formatosValidos.includes(file.mimetype)) {
    throw new Error('Formato no válido. Sube JPG, PNG o WEBP.');
  }

  // 2. Creamos un nombre único: idDelEquipo_170948392.jpg
  const extension = file.originalname.split('.').pop();
  const nombreArchivo = `${itemId}_${Date.now()}.${extension}`;

  // 3. Mandamos el Buffer al repositorio (Storage)
  const urlPublica = await inventoryRepository.subirImagenStorage(
    file.buffer, 
    nombreArchivo, 
    file.mimetype
  );

  // 4. Guardamos la URL en la tabla del equipo
  await inventoryRepository.actualizarImagenUrl(itemId, urlPublica);

  return urlPublica; // Devolvemos el link al Frontend
};

const exportarExcel = async (filtros, columnasSeleccionadas) => {
  // 1. Obtenemos la data usando el repositorio avanzado que acabamos de mejorar
  const itemsBrutos = await inventoryRepository.obtenerInventario(filtros);

  // 2. Mapeamos los datos para el reporte
  const dataFormateada = itemsBrutos.map(item => ({
    codigo: item.codigo_barras || item.serie_fabricante || 'S/N',
    nombre: item.nombre,
    categoria: item.categorias?.nombre || 'Sin categoría',
    sede: item.sedes?.nombre || 'N/A',
    stock: item.cantidad_stock,
    unidad: item.unidad_medida,
    estado: item.estado_operativo || 'Operativo',
    proveedor: item.es_externo 
      ? `EXTERNO - ${item.clientes_empresas?.nombre_comercial || 'S/N'}` 
      : (item.proveedores?.nombre_empresa || 'PROPIO'),
    fecha: new Date(item.created_at).toLocaleDateString('es-ES')
  }));

  // 3. Diccionario de configuración de columnas para el motor ExcelJS
  const configMaster = {
    codigo: { header: 'CÓDIGO/SERIE', key: 'codigo', width: 20 },
    nombre: { header: 'ARTÍCULO', key: 'nombre', width: 40 },
    categoria: { header: 'CATEGORÍA', key: 'categoria', width: 25 },
    sede: { header: 'UBICACIÓN', key: 'sede', width: 25 },
    stock: { header: 'STOCK', key: 'stock', width: 10 },
    unidad: { header: 'UNIDAD', key: 'unidad', width: 10 },
    estado: { header: 'ESTADO', key: 'estado', width: 20 },
    proveedor: { header: 'ORIGEN', key: 'proveedor', width: 30 },
    fecha: { header: 'FECHA REG.', key: 'fecha', width: 15 }
  };

  const columnasFinales = columnasSeleccionadas.map(col => configMaster[col]);

  // 4. Generamos el buffer usando el utilitario genérico
  return await generarExcelGenerico(dataFormateada, columnasFinales, 'Reporte_Kardex');
};
const importarMasivo = async (items) => {
  if (!items || items.length === 0) throw new Error("No hay equipos para importar.");
  // Llamamos a la función que ya tenías viva en el repository
  return await inventoryRepository.importarItemsMasivo(items);
};
module.exports = {
  registrarEntrada, registrarCategoria, registrarProveedor, subirImagenEquipo,
  listarCategorias, listarProveedores, listarInventario, obtenerHistorial, obtenerEquipoPorId, listarSedes,
  actualizarEquipo, actualizarCategoria, actualizarProveedor, 
  exportarExcel, importarMasivo
};