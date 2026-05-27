import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, Pencil, Unlock, X, Check, MapPin, Phone, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { configurationService } from '../services/configurationService';

const formSchema = z.object({
  nombre_empresa: z.string().min(3, "Mínimo 3 letras requeridas"),
  ruc_empresa: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
});

export const ProfileForm = ({ configInicial, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_empresa: "",
      ruc_empresa: "",
      direccion: "",
      telefono: "",
    },
  });

  // Cargar datos cuando el componente padre los traiga de Supabase
  useEffect(() => {
    if (configInicial) {
      form.reset({
        nombre_empresa: configInicial.nombre_empresa || "",
        ruc_empresa: configInicial.ruc_empresa || "",
        direccion: configInicial.direccion || "",
        telefono: configInicial.telefono || "",
      });
    }
  }, [configInicial, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await configurationService.actualizarPerfil(values);
      toast({ title: "¡Perfil Actualizado!", description: "Los datos comerciales han sido guardados." });
      setIsEditing(false);
      if (onUpdated) onUpdated(); // Refresca la vista principal
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al guardar perfil", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Si el usuario cancela, restauramos los valores a como estaban en la BD
    form.reset({
      nombre_empresa: configInicial?.nombre_empresa || "",
      ruc_empresa: configInicial?.ruc_empresa || "",
      direccion: configInicial?.direccion || "",
      telefono: configInicial?.telefono || "",
    });
    setIsEditing(false);
  };

  // Clases dinámicas calcadas de tu diseño para el Input
  const inputDinámico = `pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      
      {/* HEADER CON BOTÓN DE DESBLOQUEO */}
      <div className="bg-zinc-50/80 p-5 border-b border-zinc-200 flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-zinc-700" />}
            {isEditing ? "Editando Perfil" : "Datos Comerciales"}
          </h3>
          <p className="text-sm text-zinc-500">Información principal de la empresa.</p>
        </div>
        
        {!isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" size="sm">
            <Unlock className="w-4 h-4 mr-2" /> Editar
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NOMBRE DE LA EMPRESA */}
            <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
              <FormItem className="space-y-1.5 md:col-span-2">
                <FormLabel className="text-sm font-semibold text-zinc-900">Nombre de la Empresa / Comercial *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input className={inputDinámico} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* RUC / IDENTIFICACIÓN */}
            <FormField control={form.control} name="ruc_empresa" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">RUC / Identificación</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input className={inputDinámico} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* TELÉFONO */}
            <FormField control={form.control} name="telefono" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">Teléfono de Contacto</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input type="tel" className={inputDinámico} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* DIRECCIÓN */}
            <FormField control={form.control} name="direccion" render={({ field }) => (
              <FormItem className="space-y-1.5 md:col-span-2">
                <FormLabel className="text-sm font-semibold text-zinc-900">Dirección Principal</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input className={inputDinámico} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </div>

          {/* FOOTER DE ACCIONES */}
          {isEditing && (
            <div className="border-t border-zinc-200 pt-6 mt-4 flex gap-3 justify-end">
              <Button type="button" variant="outline" className="h-10" onClick={handleCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit" className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar Perfil</>}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};