import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Building2, User, Phone, Mail, Check, FileText, MapPinned  } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

const CreateProviderSheet = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_empresa: "", contacto_nombre: "", telefono: "", email: "", direccion: "", razon_social: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await providerService.registrarProveedor(values);
      toast({ title: "¡Proveedor Registrado!", description: "El socio comercial ha sido guardado." });
      
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
      
    } catch (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
        <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
      </Button>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 space-y-1">
          <SheetTitle className="text-2xl font-bold text-zinc-950">Añadir Proveedor</SheetTitle>
          <SheetDescription className="text-zinc-600">
            Registra un nuevo socio comercial, marca o distribuidor.
          </SheetDescription>
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
                      <Input placeholder="Ej. Cisco, Sonda, Sistek..." className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="razon_social" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Razón Social</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText  className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="1712345678" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
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
                      <Input placeholder="Ej. Juan Pérez (Ventas)" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
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
                        <Input placeholder="Ej. 0987654321" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Correo Eléctronico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Ej. ventas@empresa.com" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
                <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Dirección *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Av. Principal 123, Ciudad..." className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="border-t border-zinc-200 pt-6 mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-base font-semibold transition-all hover:scale-[1.01]" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar Proveedor</>}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateProviderSheet;