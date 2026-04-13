import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, User, Phone, Mail, Check, FileText, MapPinned, Pencil, Unlock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { providerService } from '../services/providerService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_empresa: z.string().min(3, "Requerido (Mín. 3 letras)"),
  contacto_nombre: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal('')),
  direccion: z.string().optional(),
  razon_social: z.string().optional(),
});

const EditProviderSheet = ({ provider, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_empresa: "", contacto_nombre: "", telefono: "", email: "", direccion: "", razon_social: "" },
  });

  // Efecto para rellenar los datos cuando se abre el Sheet
  useEffect(() => {
    if (provider && isOpen) {
      form.setValue("nombre_empresa", provider.nombre_empresa || "");
      form.setValue("contacto_nombre", provider.contacto_nombre || "");
      form.setValue("telefono", provider.telefono || "");
      form.setValue("email", provider.email || "");
      form.setValue("direccion", provider.direccion || "");
      form.setValue("razon_social", provider.razon_social || "");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false); // Volver a bloquear al cerrar
    }
  }, [provider, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await providerService.actualizarProveedor(provider.id, values);
      toast({ title: "¡Actualizado!", description: "La ficha del proveedor se modificó correctamente." });
      
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
      
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clase dinámica para los inputs dependiendo de si estamos editando o no
  const inputClass = `pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER CON BOTÓN DE DESBLOQUEO */}
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start sticky top-0 z-10 shadow-sm">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Proveedor" : "Ficha del Proveedor"}
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              {isEditing ? "Modifica los datos comerciales y guarda." : "Información de contacto y facturación."}
            </SheetDescription>
          </div>
          
          {!isEditing && (
            <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" size="sm">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              
              <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Empresa *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="razon_social" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Razón Social / RUC</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contacto_nombre" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Nombre del Contacto</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Teléfono</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input className={inputClass} {...field} readOnly={!isEditing} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input className={inputClass} {...field} readOnly={!isEditing} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Dirección</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* FOOTER DE ACCIONES (Solo visible si está editando) */}
            {isEditing && (
              <div className="border-t border-zinc-200 pt-6 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar</>}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProviderSheet;