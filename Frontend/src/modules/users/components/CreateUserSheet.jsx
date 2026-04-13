import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, UserPlus, Mail, Lock, User, Shield, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userService } from '../services/userService';
import { useToast } from "@/hooks/use-toast";

// Validación estricta para crear usuarios
const formSchema = z.object({
  nombre_completo: z.string().min(3, "Mínimo 3 letras"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol_id: z.string().min(1, "Debes seleccionar un rol"),
  sede_id: z.string().optional(), // Opcional porque un SuperAdmin podría no tener sede fija
});

const CreateUserSheet = ({ onCreated, roles = [], sedes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_completo: "", email: "", password: "", rol_id: "", sede_id: "none" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Si el usuario eligió "Sin Sede", lo mandamos como null al backend
      const datosFinales = {
        ...values,
        sede_id: values.sede_id === "none" ? null : values.sede_id
      };

      await userService.registrarUsuario(datosFinales);
      toast({ title: "¡Usuario Creado!", description: "La credencial y el perfil están listos." });
      
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al crear usuario", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
        <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
      </Button>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col border-l border-zinc-200">
        <div className="bg-white p-6 border-b border-zinc-200">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-950">
            <Shield className="w-6 h-6 text-blue-600" />
            Alta de Usuario
          </SheetTitle>
          <SheetDescription>Crea credenciales de acceso y asigna permisos.</SheetDescription>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 flex flex-col overflow-y-auto">
            <div className="space-y-6 flex-1">
              
              {/* DATOS PERSONALES */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Identidad</h3>
                
                <FormField control={form.control} name="nombre_completo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Nombre Completo *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Ej. Juan Pérez" className="pl-9 h-10 border-zinc-200" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Correo Electrónico *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input type="email" placeholder="usuario@soisoluciones.com" className="pl-9 h-10 border-zinc-200" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Contraseña Temporal *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-9 h-10 border-zinc-200" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* PERMISOS Y UBICACIÓN */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Accesos y Ubicación</h3>

                <FormField control={form.control} name="rol_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Rol del Sistema *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-3 h-10 border-zinc-200">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-zinc-400" />
                            <SelectValue placeholder="Seleccionar rol..." />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map(rol => (
                          <SelectItem key={rol.id} value={rol.id}>{rol.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sede_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Sede Asignada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-3 h-10 border-zinc-200">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-zinc-400" />
                            <SelectValue placeholder="Seleccionar sede..." />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="text-zinc-500 italic">Global (Sin sede específica)</SelectItem>
                        {sedes.map(sede => (
                          <SelectItem key={sede.id} value={sede.id}>{sede.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

            </div>
            
            <div className="pt-6 border-t border-zinc-200 mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-5 w-5" />}
                {isSubmitting ? "Creando credenciales..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateUserSheet;