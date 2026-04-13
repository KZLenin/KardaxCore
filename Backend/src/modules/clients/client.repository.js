const supabase = require('../../config/supabase');

const obtenerClientes = async () => {
  // 🔥 Magia relacional: Traemos la empresa y anidamos sus sucursales en un solo JSON
  const { data, error } = await supabase
    .from('clientes_empresas')
    .select(`
      *,
      sucursales:clientes_sucursales(*)
    `)
    .order('nombre_comercial');

  if (error) throw new Error(`Error al obtener clientes: ${error.message}`);
  return data;
};

const crearEmpresa = async (datosEmpresa) => {
  const { data, error } = await supabase
    .from('clientes_empresas')
    .insert([datosEmpresa])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un cliente con este RUC o Nombre.');
    throw new Error(`Error BD Empresa: ${error.message}`);
  }
  return data;
};

const crearSucursal = async (datosSucursal) => {
  const { data, error } = await supabase
    .from('clientes_sucursales')
    .insert([datosSucursal])
    .select()
    .single();

  if (error) throw new Error(`Error BD Sucursal: ${error.message}`);
  return data;
};

const actualizarEmpresa = async (id, datosEmpresa) => {
  const { data, error } = await supabase
    .from('clientes_empresas')
    .update(datosEmpresa)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD Empresa: ${error.message}`);
  return data;
};

const actualizarSucursal = async (id, datosSucursal) => {
  const { data, error } = await supabase
    .from('clientes_sucursales')
    .update(datosSucursal)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD Sucursal: ${error.message}`);
  return data;
};

const obtenerSucursalesPorEmpresa = async (empresaId) => {
  const { data, error } = await supabase
    .from('clientes_sucursales')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('es_matriz', { ascending: false }); // La matriz sale primero

  if (error) throw new Error(`Error BD al obtener sucursales: ${error.message}`);
  return data;
};

module.exports = {
  obtenerClientes, obtenerClientes, obtenerSucursalesPorEmpresa,
  crearEmpresa, crearSucursal,
  actualizarEmpresa, actualizarSucursal
};