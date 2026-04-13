import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import authService from '../services/auth.service';

const ForgotPasswordView = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.solicitarRecuperacion(email);
      setEnviado(true);
    } catch (err) {
      setError('Ocurrió un error al intentar enviar el correo. Intenta de nuevo.');
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
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Acceso</CardTitle>
          <CardDescription>
            {enviado ? 'Revisa tu bandeja de entrada' : 'Te enviaremos un enlace para cambiar tu clave'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {enviado ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-lg border border-green-200 flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="font-semibold text-sm">¡Correo enviado con éxito!</p>
              <p className="text-xs text-green-700">Revisa la bandeja de entrada o SPAM de <b>{email}</b></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-600">Correo Corporativo</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="usuario@soisoluciones.com" 
                    className="pl-10"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                ) : (
                  "Enviar Enlace"
                )}
              </Button>
            </form>
          )}

          <div className="pt-4 text-center">
            <Link to="/login" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio de Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordView;