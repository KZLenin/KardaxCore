const repository = require('./users.repository');

const listarRoles = async () => {
  return await repository.obtenerRoles();
};

const listarUsuarios = async () => {
  const usuariosBrutos = await repository.obtenerUsuarios();
  
  // Mapeamos para que el frontend lo consuma fácil
  return usuariosBrutos.map(user => ({
    id: user.id,
    email: user.email,
    nombre_completo: user.nombre_completo,
    rol: user.roles?.nombre || 'Sin Rol',
    rol_id: user.rol_id,
    sede: user.sedes?.nombre || 'Global (Sin Sede)',
    sede_id: user.sede_id,
    estado: user.estado,
    fecha_creacion: user.creado_at
  }));
};

const registrarUsuario = async (datos) => {
  if (!datos.email || !datos.password || !datos.nombre_completo || !datos.rol_id) {
    throw new Error('Faltan datos obligatorios para crear el usuario.');
  }

  if (datos.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const datosLimpios = {
    ...datos,
    email: datos.email.trim().toLowerCase(),
    nombre_completo: datos.nombre_completo.trim()
  };

  return await repository.crearUsuarioAuthYPerfil(datosLimpios);
};

module.exports = {
  listarRoles,
  listarUsuarios,
  registrarUsuario
};