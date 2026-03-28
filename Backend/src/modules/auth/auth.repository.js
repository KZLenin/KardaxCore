const supabase = require('../../config/supabase');

const iniciarSesion = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Credenciales inválidas: ${error.message}`);
  return data;
};

const obtenerPerfilUsuario = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles_usuario')
    .select('nombre_completo, roles(nombre), sede_id')
    .eq('id', userId)
    .single();
  if (error) throw new Error(`Error al obtener perfil: ${error.message}`);
  return data;
};

// --- MÉTODOS TOTP (2FA) ---
const enrolarTOTP = async (userId) => {
  // Le pedimos a Supabase que genere el secreto para este usuario
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    userId: userId // Necesitamos el ID del usuario
  });
  if (error) throw new Error(`Error al generar 2FA: ${error.message}`);
  return data;
};

const verificarTOTP = async (factorId, codigo) => {
  // Creamos el desafío y lo verificamos con el código de 6 dígitos
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw new Error('Error al iniciar verificación 2FA');

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code: codigo
  });
  
  if (error) throw new Error(`Código incorrecto: ${error.message}`);
  return data;
};

const solicitarRecuperacion = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      // Esta es la URL de tu frontend en React a donde Supabase enviará al usuario.
      // (Vite usa el puerto 5173 por defecto, cámbialo si usas otro)
      redirectTo: 'http://localhost:5173/reset-password', 
    });
    
    if (error) throw new Error(`Error de Supabase: ${error.message}`);
    return data;
  };
  
  const actualizarPassword = async (newPassword) => {
    // Como el usuario usará el token temporal que le llegó al correo para llegar a esta ruta,
    // Supabase ya sabrá quién es. Solo le pasamos la nueva clave.
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) throw new Error(`Error al actualizar clave: ${error.message}`);
    return data;
  };

  const obtenerTodosLosUsuarios = async () => {
    const { data, error } = await supabase
      .from('perfiles_usuario')
      .select('id, email, nombre_completo, estado, roles(nombre), sedes(nombre)');
    if (error) throw new Error(error.message);
    return data;
  };

module.exports = { 
  iniciarSesion, 
  obtenerPerfilUsuario,
  obtenerTodosLosUsuarios, 
  enrolarTOTP, 
  verificarTOTP,
  solicitarRecuperacion,
  actualizarPassword, 
};