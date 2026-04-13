import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, MapPin, User, Phone, Mail, Check, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

import { clientService } from '../services/clientService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_sucursal: z.string().min(3, "Mínimo 3 letras"),
  es_matriz: z.boolean().default(false),
  contacto_nombre: z.string().min(3, "Nombre de quien recibe es requerido"),
  telefono: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal('')),
  direccion: z.string().optional(),
});

const CreateSucursalSheet = ({ empresaId, empresaNombre, onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_sucursal: "", es_matriz: false, contacto_nombre: "", telefono: "", email: "", direccion: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await clientService.crearSucursal(empresaId, values);
      toast({ title: "¡Sede Registrada!", description: `Punto de entrega añadido a ${empresaNombre}.` });
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button 
        onClick={() => setIsOpen(true)} 
        disabled={!empresaId} // 🔥 Bloqueado si no hay empresa seleccionada
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
      >
        <Plus className="w-4 h-4 mr-2" /> Añadir Sede
      </Button>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0">
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-950">
            <MapPin className="w-5 h-5 text-blue-600" /> Nuevo Punto de Entrega
          </SheetTitle>
          <SheetDescription className="text-zinc-600">
            Añadiendo sede para: <span className="font-semibold text-zinc-800">{empresaNombre}</span>
          </SheetDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            
            <div className="space-y-4">
              <FormField control={form.control} name="nombre_sucursal" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Nombre de la Sede *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Local Condado" className="pl-9 h-10 bg-white" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Dirección Física</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Av. Principal y Secundaria..." className="pl-9 h-10 bg-white" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="es_matriz" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">¿Es la Matriz?</FormLabel>
                    <FormDescription className="text-xs text-zinc-500">
                      Márcala si es el edificio principal.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Persona Responsable en Sede
              </h3>

              <FormField control={form.control} name="contacto_nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Nombre de quien recibe *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Juan Pérez (Bodeguero)" className="pl-9 h-10 bg-white" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Teléfono Sede</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input placeholder="099..." className="pl-9 h-10 bg-white" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Correo Sede</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input placeholder="@sede.com" className="pl-9 h-10 bg-white" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <SheetFooter className="mt-8 pt-6 border-t border-zinc-200">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                Guardar Sede
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSucursalSheet;