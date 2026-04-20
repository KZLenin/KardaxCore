const supabase = require('../../config/supabase');

// Esta función solo se encarga de ir a la base de datos y volver. Cero lógica de negocio.
const crearItemKardex = async (datosItem) => {
  const { data, error } = await supabase
    .from('inventario')
    .insert([
      {
        sede_id: datosItem.sedeId,
        cat_id: datosItem.categoriaId,
        nombre: datosItem.nombre,
        serie_fabricante: datosItem.serie_fabricante,
        proveedor_id: datosItem.proveedorId || null,
        detalles: datosItem.detalles || {},
        //Externo
        es_externo: datosItem.es_externo || false,
        cliente_id: datosItem.cliente_id || null,
        sucursal_id: datosItem.sucursal_id || null,
        notas_ingreso: datosItem.notas_ingreso || null
      }
    ])
    .select() // Pedimos que nos devuelva el registro recién creado
    .single(); // Como es un solo insert, pedimos un solo objeto, no un array

  // Si Supabase tira un error (ej. serie duplicada), lo lanzamos para que el Servicio lo atrape
  if (error) {
    if (error.code === '23505') { // 23505 es el código SQL de Postgres para UNIQUE_VIOLATION
      throw new Error('Ya existe un equipo registrado con esa Serie.');
    }
    throw new Error(`Error en la base de datos: ${error.message}`);
  }

  return data;
};
const crearCategoria = async (categoria) => {
  const { data, error } = await supabase.from('categorias').insert([categoria]).select().single();
  if (error) throw new Error(`Error al crear categoría: ${error.message}`);
  return data;
};

const obtenerCategorias = async () => {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const obtenerProveedores = async () => {
  const { data, error } = await supabase.from('proveedores').select('*');
  if (error) throw new Error(error.message);
  return data;
};
const crearProveedor = async (proveedor) => {
  const { data, error } = await supabase.from('proveedores').insert([proveedor]).select().single();
  if (error) throw new Error(error.message);
  return data;
};

const obtenerInventario = async (filtros) => {
  // 1. Consulta base con Joins (Relaciones)
  // Nota: Asegúrate de que los nombres de las tablas coincidan (categorias, sedes, proveedores)
  let query = supabase
    .from('inventario')
    .select(`
      *,
      categorias (nombre),
      sedes (nombre),
      proveedores (nombre_empresa),
      clientes_empresas (nombre_comercial),
      clientes_sucursales (nombre_sucursal),
    `);

  // 2. Filtros Dinámicos
  if (filtros.categoriaId) query = query.eq('cat_id', filtros.categoriaId);
  if (filtros.sedeId) query = query.eq('sede_id', filtros.sede_id);
  if (filtros.proveedorId) query = query.eq('prov_id', filtros.proveedorId);
  
  // Filtro de búsqueda por nombre (opcional pero muy útil)
  if (filtros.buscar) {
    query = query.or(
      `nombre.ilike.%${filtros.buscar}%,codigo_barras.ilike.%${filtros.buscar}%,serie_fabricante.ilike.%${filtros.buscar}%`
    );
  }

  // 3. Ordenamiento Alfabético (Requerido)
  query = query.order('nombre', { ascending: true });

  const { data, error } = await query;

  if (error) throw new Error(`Error al obtener el Kardex: ${error.message}`);
  return data;
};

const actualizarItem = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('inventario')
    .update(datosActualizados)
    .eq('id', id)
    .select(`
    id, nombre, cantidad_stock, unidad_medida, codigo_barras, serie_fabricante,
    cat_id, 
    proveedor_id,
    categorias ( nombre ),
    proveedores ( nombre_empresa )
  `); 

  if (error) throw new Error(`Error en BD al actualizar equipo: ${error.message}`);
  if (!data || data.length === 0) throw new Error('Equipo no encontrado en la base de datos');
  
  return data[0];
};

// Obtener el historial de un equipo específico, ordenado del más reciente al más antiguo
const obtenerHistorialItem = async (itemId) => {
  const { data, error } = await supabase
    .from('historial_seguimiento')
    .select('*')
    .eq('item_id', itemId)
    .order('fecha_registro', { ascending: false });

  if (error) throw new Error(`Error al obtener el historial: ${error.message}`);
  return data;
};

// Función silenciosa para registrar auditoría (El Cronista)
const registrarHistorial = async (itemId, tipoAccion, descripcion, usuarioResponsable = 'Sistema', ventaId = null, evidenciaUrl = null) => {
  const { error } = await supabase
    .from('historial_seguimiento')
    .insert([{
      item_id: itemId,
      tipo_accion: tipoAccion,
      descripcion: descripcion,
      usuario_responsable: usuarioResponsable, // Tu BD lo tiene como texto
      venta_id: ventaId,
      evidencia_url: evidenciaUrl,
      ubicacion_actual: 'Mantenimiento' // Opcional, puedes mejorarlo después
    }]);

  if (error) {
    // Solo lo imprimimos en consola para no romper la app si la auditoría falla
    console.error('🚨 [Auditoría Falló]:', error.message); 
  }
};

const obtenerItemPorId = async (id) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('id, nombre, codigo_barras') // Solo pedimos lo necesario para la etiqueta
    .eq('id', id)
    .single();

  if (error) throw new Error(`Error BD al obtener equipo: ${error.message}`);
  return data;
};
const importarItemsMasivo = async (items) => {
  // items es un array de objetos [{nombre: '...', stock: 10}, ...]
  const { data, error } = await supabase
    .from('inventario')
    .insert(items)
    .select();

  if (error) throw new Error(`Error en carga masiva: ${error.message}`);
  return data;
};

const actualizarCategoria = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('categorias')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar categoría: ${error.message}`);
  return data;
};

const actualizarProveedor = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('proveedores')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar proveedor: ${error.message}`);
  return data;
};

const obtenerSedes = async () => {
  const { data, error } = await supabase
    .from('sedes')
    .select('id, nombre')
    .order('nombre', { ascending: true });
    
  if (error) throw new Error(`Error al obtener sedes: ${error.message}`);
  return data;
};

// Sube el archivo físico al Bucket de Supabase
const subirImagenStorage = async (fileBuffer, fileName, mimetype) => {
  const { data, error } = await supabase.storage
    .from('inventario') // El nombre exacto de tu bucket público
    .upload(`equipos/${fileName}`, fileBuffer, {
      contentType: mimetype,
      upsert: true // Si suben otra foto con el mismo nombre, la reemplaza
    });

  if (error) throw new Error(`Error en Supabase Storage: ${error.message}`);

  // Pedimos la URL pública para que React pueda mostrarla
  const { data: publicData } = supabase.storage
    .from('inventario')
    .getPublicUrl(`equipos/${fileName}`);

  return publicData.publicUrl;
};

// Guarda la URL en la tabla del inventario
const actualizarImagenUrl = async (id, imagenUrl) => {
  const { data, error } = await supabase
    .from('inventario')
    .update({ imagen_url: imagenUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error DB al guardar URL: ${error.message}`);
  return data;
};

module.exports = {
  crearItemKardex, crearCategoria, crearProveedor, registrarHistorial, subirImagenStorage,
  obtenerCategorias, obtenerProveedores, obtenerInventario, obtenerHistorialItem, obtenerItemPorId, obtenerSedes,
  actualizarItem, actualizarCategoria, actualizarProveedor, actualizarImagenUrl,
  importarItemsMasivo,
};