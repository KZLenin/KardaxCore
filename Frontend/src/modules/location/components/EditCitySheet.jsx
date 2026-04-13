import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin, Globe, Check, Pencil, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService } from '../services/locationService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  pais_id: z.string().min(1, "Debes seleccionar un país"),
});

const EditCitySheet = ({ city, paises = [], isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", pais_id: "" },
  });

  useEffect(() => {
    if (city && isOpen) {
      form.setValue("nombre", city.nombre || "");
      form.setValue("pais_id", city.pais_id || "");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [city, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await locationService.actualizarCiudad(city.id, values);
      toast({ title: "¡Actualizado!", description: "Información de la ciudad modificada." });
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <MapPin className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Ciudad" : "Ficha de Ciudad"}
            </SheetTitle>
            <SheetDescription>{isEditing ? "Modifica los datos y la jurisdicción." : "Información registrada."}</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              
              <FormField control={form.control} name="pais_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">País Perteneciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                    <FormControl>
                      <SelectTrigger className={`pl-3 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 opacity-100" : "bg-white shadow-sm focus:ring-1 focus:ring-blue-500"}`}>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-zinc-400" />
                          <SelectValue placeholder="Seleccionar país..." />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paises.map(pais => (
                        <SelectItem key={pais.id} value={pais.id.toString()}>{pais.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">Nombre de la Ciudad</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            {isEditing && (
              <div className="pt-6 border-t border-zinc-200 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isSubmitting}>
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

export default EditCitySheet;