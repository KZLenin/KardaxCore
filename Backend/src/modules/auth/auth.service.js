const authRepository = require('./auth.repository');

const procesarLogin = async (email, password) => {
  if (!email || !password) throw new Error('Email y contraseña son obligatorios');

  // 1. Validamos en Supabase
  const authData = await authRepository.iniciarSesion(email, password);
  
  // 2. Traemos su perfil de SOI Soluciones
  const perfil = await authRepository.obtenerPerfilUsuario(authData.user.id);

  // 3. Verificamos si necesita 2FA
  // Supabase nos avisa si el usuario ya tiene configurado el Authenticator
  const requiere2FA = authData.session === null || authData.user.factors?.length > 0;

  return {
    requiere2FA,
    userId: authData.user.id,
    // Si requiere 2FA, no devolvemos el token final todavía
    token: requiere2FA ? null : authData.session.access_token, 
    usuario: {
      id: authData.user.id,
      email: authData.user.email,
      nombre: perfil.nombre_completo,
      rol: perfil.roles.nombre,
      sedeId: perfil.sede_id
    }
  };
};

const generarQr2FA = async (userId) => {
  const mfaData = await authRepository.enrolarTOTP(userId);
  // Devolvemos el factorId y el código QR en formato SVG o URI para que React lo dibuje
  return {
    factorId: mfaData.id,
    qrCode: mfaData.totp.qr_code // Esto es lo que escanea el celular
  };
};

const procesarRecuperacion = async (email) => {
    if (!email) throw new Error('El correo es obligatorio para recuperar la contraseña.');
    return await authRepository.solicitarRecuperacion(email);
  };
  
  const procesarNuevaPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  }
  // Le pasamos el userId al repo
  return await authRepository.actualizarPassword(userId, newPassword);
};

const procesarRegistro = async (datosUsuario) => {
  const { email, password, nombre_completo, rol_id, sede_id } = datosUsuario;

  // 1. Validaciones básicas
  if (!email || !password || !nombre_completo || !rol_id) {
    throw new Error('Email, contraseña, nombre y rol son obligatorios.');
  }
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  // 2. Creamos en Supabase Auth
  const usuarioAuth = await authRepository.crearUsuarioAuth(email, password);

  // 3. Creamos su perfil en la base de datos
  const perfil = await authRepository.crearPerfilUsuario(
    usuarioAuth.id, 
    nombre_completo, 
    rol_id, 
    sede_id || null // La sede podría ser opcional dependiendo de tu lógica
  );

  return { usuarioAuth, perfil };
};

module.exports = { 
    procesarLogin, 
    generarQr2FA,
    procesarRecuperacion,  
    procesarNuevaPassword,
    procesarRegistro
};