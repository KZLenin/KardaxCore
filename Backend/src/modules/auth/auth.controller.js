const authService = require('./auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const resultado = await authService.procesarLogin(email, password);

    if (resultado.requiere2FA) {
      return res.status(202).json({
        mensaje: 'Credenciales correctas. Se requiere código 2FA.',
        requiere2FA: true,
        userId: resultado.usuario.id // El front necesita esto para el siguiente paso
      });
    }

    res.status(200).json({
      mensaje: 'Login exitoso',
      token: resultado.token,
      usuario: resultado.usuario
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const configurar2FA = async (req, res) => {
  try {
    // Asumimos que el usuario ya pasó la primera fase del login
    const { userId } = req.body; 
    const qrData = await authService.generarQr2FA(userId);
    
    res.status(200).json({
      mensaje: 'Escanea este QR en Google Authenticator',
      ...qrData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const solicitarRecuperacion = async (req, res) => {
    try {
      const { email } = req.body;
      await authService.procesarRecuperacion(email);
      
      // Por seguridad, siempre devolvemos el mismo mensaje aunque el correo no exista,
      // así evitamos que hackers averigüen qué correos están registrados en SOI Soluciones.
      res.status(200).json({ 
        mensaje: 'Si el correo existe en el sistema, se ha enviado un enlace de recuperación.' 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const cambiarPassword = async (req, res) => {
    try {
      const { newPassword } = req.body;
      await authService.procesarNuevaPassword(newPassword);
      
      res.status(200).json({ mensaje: '¡Contraseña actualizada con éxito!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const getUsuarios = async (req, res) => {
    try {
      const usuarios = await authRepository.obtenerTodosLosUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

module.exports = { 
    login, 
    configurar2FA,
    solicitarRecuperacion, 
    cambiarPassword,
    getUsuarios 
};