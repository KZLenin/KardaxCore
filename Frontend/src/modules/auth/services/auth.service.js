import httpClient from '@/core/api/httpClient.js';

// ==========================================
// SERVICIO DE AUTENTICACIÓN (FRONTEND)
// ==========================================

const authService = {
  /**
   * Envía las credenciales al backend para iniciar sesión.
   */
  login: async (email, password) => {
    try {
      // Le pegamos a la ruta exacta de tu backend
      const response = await httpClient.post('/auth/login', { email, password }, { isLogin: true });
      
      // Si el backend nos devuelve el token directamente (sin 2FA), lo guardamos
      if (response.data.token) {
        localStorage.setItem('kardax_token', response.data.token);
        localStorage.setItem('kardax_user', JSON.stringify(response.data.usuario));
      }

      // Devolvemos la data para que la pantalla de Login sepa qué hacer
      // (ej. mostrar mensaje de éxito o redirigir a la pantalla del 2FA)
      return response.data; 
    } catch (error) {
      // Formateamos el error para que la UI lo pueda leer fácil
      throw error.response?.data?.error || 'Error al conectar con el servidor';
    }
  },

  /**
   * Verifica el código 2FA ingresado por el usuario.
   */
  verificar2FA: async (userId, codigo) => {
    try {
      const response = await httpClient.post('/auth/2fa/verificar', { userId, codigo });
      
      if (response.data.token) {
        localStorage.setItem('kardax_token', response.data.token);
        localStorage.setItem('kardax_user', JSON.stringify(response.data.usuario));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Código 2FA incorrecto';
    }
  },

  /**
   * Cierra la sesión borrando los datos locales y recargando la app.
   */
  logout: () => {
    localStorage.removeItem('kardax_token');
    localStorage.removeItem('kardax_user');
    window.location.href = '/login'; // Expulsamos al usuario al login
  },
  solicitarRecuperacion: async (email) => {
    const response = await httpClient.post('/auth/recuperar-password', { email });
    return response.data;
  },

  cambiarPassword: async (token, newPassword) => {
    // 🔥 TRUCO MAGISTRAL: Mandamos el token de recuperación en el Header manualmente,
    // porque el usuario aún no ha iniciado sesión de verdad.
    const response = await httpClient.post('/auth/cambiar-password', 
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default authService;