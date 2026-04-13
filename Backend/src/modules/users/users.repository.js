const supabase = require('../../config/supabase'); // Tu cliente normal
const { createClient } = require('@supabase/supabase-js');

// 🔥 ESTE ES EL CLIENTE CON PODERES DE DIOS (Bypass RLS)
// Asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tu archivo .env
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const obtenerRoles = async () => {
  const { data, error } = await supabase.from('roles').select('*').order('nombre');
  if (error) throw new Error(`Error al obtener roles: ${error.message}`);
  return data;
};

const obtenerUsuarios = async () => {
  // Traemos el perfil junto con el nombre del rol y el nombre de la sede
  const { data, error } = await supabase
    .from('perfiles_usuario')
    .select(`
      *,
      roles (nombre),
      sedes (nombre)
    `)
    .order('creado_at', { ascending: false });

  if (error) throw new Error(`Error al obtener usuarios: ${error.message}`);
  return data;
};

const crearUsuarioAuthYPerfil = async (datosUsuario) => {
  // 1. Creamos la identidad en Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: datosUsuario.email,
    password: datosUsuario.password,
    email_confirm: true // Para que no pida confirmar por correo de inmediato
  });

  if (authError) throw new Error(`Error en Auth: ${authError.message}`);

  const nuevoAuthId = authData.user.id;

  // 2. Creamos el perfil público en tu tabla usando el ID que nos dio Auth
  const { data: perfilData, error: perfilError } = await supabaseAdmin
    .from('perfiles_usuario')
    .insert([{
      id: nuevoAuthId,
      email: datosUsuario.email,
      nombre_completo: datosUsuario.nombre_completo,
      rol_id: datosUsuario.rol_id,
      sede_id: datosUsuario.sede_id || null, // Algunos roles pueden no tener sede (ej. Admin global)
      estado: 'ACTIVO'
    }])
    .select()
    .single();

  // Si falla el perfil, lo ideal sería borrar el auth (rollback), pero por ahora lanzamos el error
  if (perfilError) {
    await supabaseAdmin.auth.admin.deleteUser(nuevoAuthId); // Borramos la evidencia 🥷
    throw new Error(`Error al crear perfil: ${perfilError.message}`);
  }

  return perfilData;
};
const actualizarPerfilUsuario = async (id, datosActualizados) => {
  // 1. Actualizamos tu tabla de perfiles (El Gafete)
  const { data, error } = await supabaseAdmin
    .from('perfiles_usuario')
    .update(datosActualizados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error BD al actualizar perfil: ${error.message}`);

  // 2. 🔥 LE AVISAMOS AL PORTERO (SUPABASE AUTH) 🔥
  // Si en la actualización viene un cambio de estado, actuamos en consecuencia
  if (datosActualizados.estado) {
    if (datosActualizados.estado === 'INACTIVO') {
      // Lo baneamos por 100 años (bloquea futuros inicios de sesión)
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    } else if (datosActualizados.estado === 'ACTIVO') {
      // Le quitamos el ban por si lo estamos reactivando
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' });
    }
  }

  return data;
};

module.exports = {
  obtenerRoles, obtenerUsuarios,
  crearUsuarioAuthYPerfil,
  actualizarPerfilUsuario,
};