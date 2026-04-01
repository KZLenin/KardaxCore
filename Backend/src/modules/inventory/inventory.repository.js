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
        serie_fabricante: datosItem.serieFabricante,
        detalles: datosItem.detalles || {} // Si no mandan detalles, guardamos un JSON vacío
      }
    ])
    .select() // Pedimos que nos devuelva el registro recién creado
    .single(); // Como es un solo insert, pedimos un solo objeto, no un array

  // Si Supabase tira un error (ej. serie duplicada), lo lanzamos para que el Servicio lo atrape
  if (error) {
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
      proveedores (nombre_empresa)
    `);

  // 2. Filtros Dinámicos
  if (filtros.categoriaId) query = query.eq('cat_id', filtros.categoriaId);
  if (filtros.sedeId) query = query.eq('sede_id', filtros.sede_id);
  if (filtros.proveedorId) query = query.eq('prov_id', filtros.proveedorId);
  
  // Filtro de búsqueda por nombre (opcional pero muy útil)
  if (filtros.buscar) query = query.ilike('nombre', `%${filtros.buscar}%`);

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

module.exports = {
  crearItemKardex, crearCategoria, crearProveedor,
  obtenerCategorias, obtenerProveedores, obtenerInventario,
  actualizarItem
};