import axios from 'axios';

// 1. Instancia Base: Le decimos dónde vive tu backend
// Usamos variables de entorno (Vite usa import.meta.env)
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Si el backend no responde en 10s, abortamos para no colgar la app
});

// 2. Interceptor de Peticiones: "El Guardia de Salida"
// Antes de que cualquier petición salga hacia el backend, pasa por aquí.
httpClient.interceptors.request.use(
  (config) => {
    // Buscamos el token del usuario (lo guardaremos aquí al hacer login)
    const token = localStorage.getItem('kardax_token');
    
    // Si hay token, se lo inyectamos a los headers automáticamente
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas: "El Guardia de Entrada"
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Buscamos nuestra bandera secreta en la configuración de la petición
    const esPeticionDeLogin = error.config ? error.config.isLogin : false;

    // 2. Si da error 401 Y NO tiene la bandera secreta, entonces sí lo expulsamos
    if (error.response && error.response.status === 401 && !esPeticionDeLogin) {
      console.warn('Sesión expirada o no autorizada. Cerrando sesión...');
      localStorage.removeItem('kardax_token');
      localStorage.removeItem('kardax_user');
      
      window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export default httpClient;