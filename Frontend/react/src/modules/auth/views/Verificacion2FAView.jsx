import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Verificacion2FAView = () => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperamos el userId que nos mandó el LoginView "escondido" en el state
  const userId = location.state?.userId;

  // Medida de seguridad: Si alguien intenta entrar a esta URL directamente
  // sin haber pasado por el login (no hay userId), lo pateamos de vuelta.
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const handleVerificar = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Llamamos a nuestro servicio pasándole el ID y los 6 dígitos
      await authService.verificar2FA(userId, codigo);
      
      // Si no explota, significa que Supabase aceptó el TOTP y ya tenemos token.
      // ¡Aterrizamos en el sistema!
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Autenticación de 2 Pasos</h2>
          <p className="text-sm text-gray-500 mt-2">
            Abre tu aplicación de Authenticator e ingresa el código de 6 dígitos.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerificar} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength="6"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} // Solo números
              required
              className="mt-1 block w-full p-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || codigo.length !== 6}
            className={`w-full py-2 px-4 text-white font-bold rounded ${
              loading || codigo.length !== 6 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Verificando...' : 'Confirmar'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Verificacion2FAView;