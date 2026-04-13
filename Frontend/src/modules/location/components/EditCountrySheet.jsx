import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Globe, Check, Pencil, Unlock, X, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { locationService } from '../services/locationService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  prefijo: z.string().min(2, "Mínimo 2 letras"),
});

const EditCountrySheet = ({ country, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", prefijo: "" },
  });

  useEffect(() => {
    if (country && isOpen) {
      form.setValue("nombre", country.nombre || "");
      form.setValue("prefijo", country.prefijo || "");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [country, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await locationService.actualizarPais(country.id, values);
      toast({ title: "¡Actualizado!", description: "Información del país modificada con éxito." });
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "bg-white shadow-sm"}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Globe className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar País" : "Ficha del País"}
            </SheetTitle>
            <SheetDescription>{isEditing ? "Modifica los datos regionales." : "Información registrada."}</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Nombre del País</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input className={inputClass} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="prefijo" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Prefijo / Código</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input className={`${inputClass} uppercase`} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-amber-600 font-medium">
                  ⚠️ Cambiar el prefijo no afectará a los equipos que ya tienen un código generado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            {isEditing && (
              <div className="pt-6 border-t mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Guardar Cambios"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditCountrySheet;