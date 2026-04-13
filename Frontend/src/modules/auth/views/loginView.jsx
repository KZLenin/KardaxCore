import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";

import authService from '../services/auth.service';
import LoginForm from '../components/LoginForm';
import TwoFactorForm from '../components/TwoFactorForm';

const LoginPage = () => {
  const navigate = useNavigate();
    
  // Estados de la máquina de estados del login
  const [step, setStep] = useState('login'); // 'login' | '2fa'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tempUserId, setTempUserId] = useState(null); // Guardamos el ID para el 2FA

  // 1. Manejador del Primer Paso (Email/Password)
  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      
      if (response.requiere2FA) {
        setTempUserId(response.userId);
        setStep('2fa');
      } else {
        // Login directo (si el 2FA estuviera desactivado para este usuario)
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejador del Segundo Paso (Código 2FA)
  const on2FASubmit = async (codigo) => {
    setLoading(true);
    setError(null);
    try {
      await authService.verificar2FA(tempUserId, codigo);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[400px] shadow-xl border-zinc-200">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-zinc-900 rounded-xl shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 'login' ? 'Bienvenido a Kardex Core' : 'Verificación de Seguridad'}
          </CardTitle>
          <CardDescription>
            {step === 'login' 
              ? 'Ingresa tus credenciales corporativas' 
              : 'Hemos enviado un código a tu correo'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <AlertDescription className="text-xs font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === 'login' ? (
            <div className="space-y-4">
              <LoginForm onSubmit={onLoginSubmit} isLoading={loading} />
              
              
            </div>
          ) : (
            <TwoFactorForm 
              onSubmit={on2FASubmit} 
              isLoading={loading} 
              onBack={() => setStep('login')} 
            />
          )}
        </CardContent>

        <footer className="px-6 pb-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
            Powered by Arkz Tech & SOI Soluciones
          </p>
        </footer>
      </Card>
    </div>
  );
};

export default LoginPage;