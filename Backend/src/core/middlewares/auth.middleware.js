const supabase = require('../../config/supabase');

// 1. El Guardia Principal: Verifica que el usuario sea real
const protegerRuta = async (req, res, next) => {
  try {
    // A. Buscamos el token en la cabecera (Frontend debe enviarlo como "Bearer eyJhb...")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado: Se requiere iniciar sesión.' });
    }

    const token = authHeader.split(' ')[1];

    // B. Le preguntamos a Supabase si este token es válido
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o sesión expirada.' });
    }

    // C. Si el usuario existe en Supabase, buscamos su Rol y su Sede en nuestra tabla
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles_usuario')
      .select('sede_id, roles(nombre)') // Traemos la sede y el nombre del rol
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Usuario autenticado, pero sin perfil configurado en SOI Soluciones.' });
    }

    // D. Inyectamos la info del usuario en la petición (req) para que el Controlador la pueda usar
    req.usuario = {
      id: user.id,
      email: user.email,
      rol: perfil.roles.nombre,
      sedeId: perfil.sede_id
    };

    // E. ¡Todo en orden! Le abrimos la puerta hacia el Controlador
    next();

  } catch (error) {
    console.error('[Auth Middleware]:', error.message);
    res.status(500).json({ error: 'Error interno en el servidor de autenticación.' });
  }
};

// 2. El Guardia VIP: Verifica si el usuario tiene el rol necesario
const soloRol = (rolRequerido) => {
  return (req, res, next) => {
    // Si es ADMIN general, siempre pasa. Si no, debe coincidir con el rol requerido.
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== rolRequerido) {
      return res.status(403).json({ 
        error: `Acceso denegado: Solo usuarios con rol ${rolRequerido} pueden hacer esto.` 
      });
    }
    next();
  };
};

module.exports = { protegerRuta, soloRol };