const supabase = require('../../config/supabase');

const crearPais = async (pais) => {
  const { data, error } = await supabase.from('paises').insert([pais]).select().single();
  if (error) throw new Error(`Error al crear país: ${error.message}`);
  return data;
};

const crearCiudad = async (ciudad) => {
  const { data, error } = await supabase.from('ciudades').insert([ciudad]).select().single();
  if (error) throw new Error(`Error al crear ciudad: ${error.message}`);
  return data;
};

const crearSede = async (sede) => {
  const { data, error } = await supabase.from('sedes').insert([sede]).select().single();
  if (error) throw new Error(`Error al crear sede: ${error.message}`);
  return data;
};



module.exports = { crearPais, crearCiudad, crearSede };