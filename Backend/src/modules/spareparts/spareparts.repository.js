const supabase = require('../../config/supabase'); // Ajusta la ruta a tu config

// 1. Agregar el repuesto a la tabla puente
const agregarRepuestoAOrden = async (datosRepuesto) => {
  const { data, error } = await supabase
    .from('orden_trabajo_repuestos')
    .insert([datosRepuesto])
    .select()
    .single();

  if (error) throw new Error(`Error al registrar el repuesto en la orden: ${error.message}`);
  return data;
};

// 2. Obtener los repuestos usados en un ticket
const obtenerRepuestosPorOrden = async (ordenId) => {
  const { data, error } = await supabase
    .from('orden_trabajo_repuestos')
    .select(`
      *,
      inventario (nombre, codigo_barras)
    `)
    .eq('orden_id', ordenId)
    .order('fecha_consumo', { ascending: false });

  if (error) throw new Error(`Error al obtener repuestos: ${error.message}`);
  return data;
};

// 3. Helper rápido para verificar el stock exacto antes de consumir
const verificarStockRepuesto = async (itemId) => {
  const { data, error } = await supabase
    .from('inventario')
    .select('id, nombre, cantidad_stock, es_externo')
    .eq('id', itemId)
    .single();

  if (error) throw new Error(`Error al verificar stock: ${error.message}`);
  return data;
};

module.exports = {
  agregarRepuestoAOrden,
  obtenerRepuestosPorOrden,
  verificarStockRepuesto
};