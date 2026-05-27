const supabase = require('../../config/supabase');

const obtenerConfiguracion = async () => {
  const { data, error } = await supabase
    .from('configuracion_empresa')
    .select('*')
    .eq('id', 1)
    .single();

  // Si no existe la fila con id=1, la creamos al vuelo para que no se rompa el frontend
  if (error && error.code === 'PGRST116') {
    const { data: newData, error: newError } = await supabase
      .from('configuracion_empresa')
      .insert([{ id: 1, nombre_empresa: 'SOI Soluciones ERP' }])
      .select()
      .single();
      
    if (newError) throw new Error(`Error al inicializar configuración: ${newError.message}`);
    return newData;
  }
  
  if (error) throw new Error(`Error BD: ${error.message}`);
  return data;
};

const actualizarCampos = async (camposNuevos) => {
  const { data, error } = await supabase
    .from('configuracion_empresa')
    .update({ ...camposNuevos, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar configuración: ${error.message}`);
  return data;
};

// Necesitaremos guardar la imagen en el storage, igual que en inventory.repository
const subirLogoStorage = async (fileBuffer, fileName, mimetype) => {
  const { error } = await supabase.storage
    .from('inventario') // Usamos tu bucket público actual
    .upload(`sistema/${fileName}`, fileBuffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) throw new Error(`Error en Supabase Storage: ${error.message}`);

  const { data: publicData } = supabase.storage
    .from('inventario')
    .getPublicUrl(`sistema/${fileName}`);

  return publicData.publicUrl;
};

module.exports = {
  obtenerConfiguracion,
  actualizarCampos,
  subirLogoStorage
};