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

module.exports = {
  crearItemKardex, crearCategoria, crearProveedor,
  obtenerCategorias, obtenerProveedores,
};