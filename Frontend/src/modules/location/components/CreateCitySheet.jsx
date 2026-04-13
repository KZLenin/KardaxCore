import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, MapPin, Globe, Check } from "lucide-react";
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

const CreateCitySheet = ({ onCreated, paises = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", pais_id: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await locationService.registrarCiudad(values);
      toast({ title: "¡Ciudad Registrada!", description: "La ciudad se ha vinculado a su país exitosamente." });
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
        <Plus className="w-4 h-4 mr-2" /> Nueva Ciudad
      </Button>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col border-l border-zinc-200">
        <div className="bg-white p-6 border-b border-zinc-200">
          <SheetTitle className="text-2xl font-bold">Registrar Ciudad</SheetTitle>
          <SheetDescription>Agrega una nueva ciudad y asígnala a un país.</SheetDescription>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              
              <FormField control={form.control} name="pais_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">País Perteneciente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-3 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm">
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
                  <FormLabel className="font-semibold text-zinc-900">Nombre de la Ciudad *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Quito, Bogotá, Lima..." className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </div>
            
            <div className="pt-6 border-t border-zinc-200 mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-5 w-5" />}
                {isSubmitting ? "Guardando..." : "Guardar Ciudad"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCitySheet;