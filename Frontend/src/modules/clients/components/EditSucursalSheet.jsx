import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin, User, Phone, Mail, Check, Building, Pencil, Unlock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

import { clientService } from '../services/clientService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_sucursal: z.string().min(3, "Mínimo 3 letras"),
  es_matriz: z.boolean().default(false),
  contacto_nombre: z.string().min(3, "Nombre requerido"),
  telefono: z.string().optional().nullable(),
  email: z.string().email("Correo inválido").optional().or(z.literal('')).nullable(),
  direccion: z.string().optional().nullable(),
});

const EditSucursalSheet = ({ sucursal, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_sucursal: "", es_matriz: false, contacto_nombre: "", telefono: "", email: "", direccion: "" },
  });

  useEffect(() => {
    if (sucursal && isOpen) {
      form.setValue("nombre_sucursal", sucursal.nombre_sucursal || "");
      form.setValue("es_matriz", sucursal.es_matriz || false);
      form.setValue("contacto_nombre", sucursal.contacto_nombre || "");
      form.setValue("telefono", sucursal.telefono || "");
      form.setValue("email", sucursal.email || "");
      form.setValue("direccion", sucursal.direccion || "");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [sucursal, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await clientService.actualizarSucursal(sucursal.id, values);
      toast({ title: "¡Actualizado!", description: "Datos de la sede guardados correctamente." });
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `pl-9 h-10 border-zinc-200 shadow-sm ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <MapPin className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Sede" : "Ficha de Sede"}
            </SheetTitle>
            <SheetDescription>Punto de entrega físico.</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 border border-blue-200" size="sm">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              
              <FormField control={form.control} name="nombre_sucursal" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Nombre de la Sede *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Dirección</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="es_matriz" render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between rounded-lg border border-zinc-200 p-4 shadow-sm ${!isEditing ? 'bg-zinc-100/50' : 'bg-white'}`}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold">¿Es la Matriz?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isEditing} />
                  </FormControl>
                </FormItem>
              )} />

              <div className="border-t border-zinc-200 pt-4 mt-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> Persona Responsable
                </h3>

                <FormField control={form.control} name="contacto_nombre" render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-sm font-semibold">Nombre de quien recibe *</FormLabel>
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
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Teléfono</FormLabel>
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
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Correo</FormLabel>
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
              </div>
            </div>

            {isEditing && (
              <div className="border-t border-zinc-200 pt-6 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
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

export default EditSucursalSheet;