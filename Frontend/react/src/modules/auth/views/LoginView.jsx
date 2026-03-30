import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service'; // Nuestro mensajero de auth

const LoginView = () => {
  // 1. Manejo de Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Hook de React Router para movernos entre pantallas
  const navigate = useNavigate();

  // 2. Función principal que se ejecuta al enviar el formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página recargue
    setError(null);
    setLoading(true);

    try {
      // Llamamos al servicio que creamos en el paso anterior
      const data = await authService.login(email, password);

      // 3. Lógica de redirección basada en la respuesta del backend
      if (data.requiere2FA) {
        // Si el backend dice que necesita 2FA, lo mandamos a esa ruta 
        // y le pasamos el userId "escondido" en el estado de la navegación
        navigate('/2fa-verificacion', { state: { userId: data.userId } });
      } else {
        // Si no requiere 2FA (o ya trajo el token), entra directo al sistema
        navigate('/dashboard');
      }
    } catch (err) {
      // Si el backend lanza error (credenciales incorrectas, etc.), lo mostramos
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container flex items-center justify-center min-h-screen bg-gray-100">
      <div className="login-box w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        
        {/* Encabezado adaptado para SOI Soluciones */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">SOI Soluciones</h1>
          <h2 className="text-gray-500">Acceso a KardaxCore</h2>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-bold rounded ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/recuperar-password')}
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginView;