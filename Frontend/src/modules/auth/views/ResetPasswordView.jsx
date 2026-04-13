import React, { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import authService from '../services/auth.service'; // Ajusta la ruta

const ResetPasswordView = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  // Magia pura: Capturamos el token que Supabase puso en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) setToken(accessToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("El enlace no es válido o ha expirado.");
    
    setLoading(true);
    setError('');
    try {
      await authService.cambiarPassword(token, password);
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-zinc-100">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">Crear Nueva Contraseña</h2>
          <p className="text-zinc-500 mt-2 text-sm">Asegúrate de usar algo que recuerdes.</p>
        </div>

        {exito ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="font-semibold text-lg">¡Contraseña Actualizada!</p>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/login'}>
              Ir al Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="pl-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">{error}</p>}
            {!token && !error && <p className="text-amber-600 text-sm font-medium text-center bg-amber-50 p-2 rounded">Buscando token de seguridad en la URL...</p>}

            <Button type="submit" className="w-full h-11 bg-zinc-900 hover:bg-zinc-800" disabled={loading || !token}>
              {loading ? <Loader2 className="animate-spin" /> : "Guardar Contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordView;