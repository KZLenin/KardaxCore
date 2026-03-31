const supabase = require('../../config/supabase');

// 1. Consultar el artículo actual (para ver si hay stock)
const obtenerItem = async (itemId) => {
  const { data, error } = await supabase.from('inventario').select('*').eq('id', itemId).single();
  if (error) throw new Error(`Error al obtener ítem: ${error.message}`);
  return data;
};

// 2. Actualizar la cantidad en bodega
const actualizarStock = async (itemId, nuevoStock) => {
  const { error } = await supabase.from('inventario').update({ cantidad_stock: nuevoStock }).eq('id', itemId);
  if (error) throw new Error(`Error al actualizar stock: ${error.message}`);
};

// 3. Registrar el ticket logístico
const insertarMovimiento = async (movimiento) => {
  const { data, error } = await supabase.from('movimientos_logisticos').insert([movimiento]).select().single();
  if (error) throw new Error(`Error al guardar movimiento: ${error.message}`);
  return data;
};

// 4. Registrar la cadena de custodia
const insertarHistorial = async (historial) => {
  const { error } = await supabase.from('historial_seguimiento').insert([historial]);
  if (error) throw new Error(`Error al guardar historial: ${error.message}`);
};

//Busca un ítem específicamente por su identificador físico (Barras o Serie)
const buscarItemPorCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('*, categorias(nombre)')
    .or(`codigo_barras.eq.${codigo},serie_fabricante.eq.${codigo}`)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignorar error de "no encontrado" para manejarlo en el service
    throw new Error(`Error al buscar código: ${error.message}`);
  }
  return data;
};

const obtenerHistorial = async () => {
  const { data, error } = await supabase
    .from('historial_seguimiento')
    .select(`
      *,
      inventario ( nombre )
    `)
    .order('fecha_registro', { ascending: false }); // Los más nuevos primero

  if (error) throw new Error(`Error al cargar la bitácora: ${error.message}`);
  return data;
};

module.exports = { obtenerItem, actualizarStock, insertarMovimiento, insertarHistorial, buscarItemPorCodigo, obtenerHistorial };