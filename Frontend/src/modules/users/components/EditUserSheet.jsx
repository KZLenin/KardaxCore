import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, User, Shield, Building, Check, Pencil, Unlock, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userService } from '../services/userService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_completo: z.string().min(3, "Mínimo 3 letras"),
  rol_id: z.string().min(1, "Debes seleccionar un rol"),
  sede_id: z.string().optional(),
  estado: z.string().min(1, "Selecciona un estado")
});

const EditUserSheet = ({ user, roles = [], sedes = [], isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_completo: "", rol_id: "", sede_id: "none", estado: "ACTIVO" },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.setValue("nombre_completo", user.nombre_completo || "");
      form.setValue("rol_id", user.rol_id || "");
      form.setValue("sede_id", user.sede_id || "none");
      form.setValue("estado", user.estado || "ACTIVO");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [user, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const datosFinales = {
        ...values,
        sede_id: values.sede_id === "none" ? null : values.sede_id
      };

      await userService.actualizarUsuario(user.id, datosFinales);
      toast({ title: "¡Actualizado!", description: "Perfil de usuario modificado correctamente." });
      
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al actualizar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "bg-white shadow-sm focus:ring-1 focus:ring-blue-500"}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col border-l border-zinc-200">
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start sticky top-0 z-10">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-950">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Shield className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Perfil" : "Ficha de Usuario"}
            </SheetTitle>
            <SheetDescription>{isEditing ? "Modifica permisos y ubicación." : "Información de acceso y sistema."}</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 flex flex-col overflow-y-auto">
            <div className="space-y-6 flex-1">
              
              {/* CORREO (SIEMPRE BLOQUEADO) */}
              <div className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">Correo Electrónico (Solo Lectura)</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input value={user?.email || ""} readOnly className="pl-9 h-10 bg-zinc-100/50 text-zinc-500 cursor-not-allowed border-zinc-200 focus-visible:ring-0" />
                </div>
                <FormDescription className="text-xs text-zinc-500">El correo pertenece a la identidad de Auth y no se puede editar aquí.</FormDescription>
              </div>

              <FormField control={form.control} name="nombre_completo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">Nombre Completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-4 border-t border-zinc-200 space-y-4">
                <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Estado del Usuario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger className={`pl-3 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white"}`}>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-zinc-400" />
                            <SelectValue placeholder="Estado..." />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVO" className="text-green-600 font-medium">ACTIVO</SelectItem>
                        <SelectItem value="INACTIVO" className="text-red-600 font-medium">INACTIVO (Bloqueado)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="rol_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-900">Rol del Sistema</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger className={`pl-3 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white"}`}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger className={`pl-3 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white"}`}>
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

            {isEditing && (
              <div className="pt-6 border-t border-zinc-200 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-5 w-5" />}
                  Guardar
                </Button>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditUserSheet;