const supabase = require('../../config/supabase');

const crearEquipoTI = async (equipo) => {
  const { data, error } = await supabase.from('equipos_ti').insert([equipo]).select().single();
  if (error) throw new Error(`Error al registrar equipo TI: ${error.message}`);
  return data;
};

const obtenerEquiposTI = async () => {
  const { data, error } = await supabase
    .from('equipos_ti')
    .select('*, inventario(codigo_barras, nombre, sedes(nombre))');
  if (error) throw new Error(error.message);
  return data;
};

module.exports = { crearEquipoTI, obtenerEquiposTI };