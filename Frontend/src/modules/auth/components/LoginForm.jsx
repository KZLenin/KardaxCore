import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";

const LoginForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-zinc-600">Contraseña</Label>
          <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-zinc-400" />
          </div>
          <Input 
            id="password" 
            type="password" 
            className="pl-10"
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando credenciales...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;