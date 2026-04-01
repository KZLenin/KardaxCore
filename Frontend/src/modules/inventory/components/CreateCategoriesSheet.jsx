import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Tags, Type, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

import { categoryService } from '../services/categoryService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  prefijo: z.string().min(2, "Mínimo 2").max(4, "Máximo 4 letras"),
});

const CreateCategorySheet = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", prefijo: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Forzamos el prefijo a mayúsculas antes de enviar
      const dataLimpia = { ...values, prefijo: values.prefijo.toUpperCase() };
      await categoryService.registrarCategoria(dataLimpia);
      
      toast({ title: "¡Categoría Creada!", description: "La clasificación se guardó correctamente." });
      
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
        <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
      </Button>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 space-y-1">
          <SheetTitle className="text-2xl font-bold text-zinc-950">Añadir Categoría</SheetTitle>
          <SheetDescription className="text-zinc-600">
            Crea una nueva clasificación para organizar la bodega.
          </SheetDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Nombre de la Categoría *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Tags className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Laptops, Routers..." className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="prefijo" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Prefijo (Para Códigos) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. LAP, ROU..." maxLength={4} className="pl-9 h-10 uppercase font-mono border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-zinc-500">Máximo 4 letras. Se usará para generar códigos de barras.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="border-t border-zinc-200 pt-6 mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-base font-semibold transition-all hover:scale-[1.01]" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar Categoría</>}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCategorySheet;