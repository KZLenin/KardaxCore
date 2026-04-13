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

const obtenerPaises = async () => {
  const { data, error } = await supabase.from('paises').select('*');
  if (error) throw new Error(`Error BD: ${error.message}`);
  return data;
};

const obtenerCiudades = async () => {
  // Con Supabase podemos traer el nombre del país en la misma consulta (JOIN)
  const { data, error } = await supabase.from('ciudades').select('*, paises(nombre)');
  if (error) throw new Error(`Error BD: ${error.message}`);
  return data;
};

const obtenerSedes = async () => {
  const { data, error } = await supabase.from('sedes').select('*, ciudades(nombre, paises(nombre))');
  if (error) throw new Error(`Error BD: ${error.message}`);
  return data;
};

const actualizarPais = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('paises')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar país: ${error.message}`);
  return data;
};

const actualizarCiudad = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('ciudades')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar ciudad: ${error.message}`);
  return data;
};

const actualizarSede = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('sedes')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar sede: ${error.message}`);
  return data;
};

module.exports = { 
  crearPais, crearCiudad, crearSede,
  obtenerPaises, obtenerCiudades, obtenerSedes,
  actualizarPais, actualizarCiudad, actualizarSede,
};