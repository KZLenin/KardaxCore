const supabase = require('../../config/supabase');

const registrarMovimiento = async (movimiento) => {
  // 1. Guardamos el registro de logística
  const { data: movData, error: movError } = await supabase
    .from('movimientos_logisticos')
    .insert([movimiento])
    .select()
    .single();

  if (movError) throw new Error(`Error BD al guardar movimiento: ${movError.message}`);

  // 2. Traemos la info del ítem maestro para poder imprimir la etiqueta
  const { data: itemData, error: itemError } = await supabase
    .from('inventario')
    .select('codigo_barras, nombre')
    .eq('id', movimiento.item_id)
    .single();

  if (itemError) throw new Error(`Error BD al obtener datos del ítem: ${itemError.message}`);

  // Devolvemos el movimiento junto con la info del ítem
  return { ...movData, item: itemData };
};

module.exports = { registrarMovimiento };