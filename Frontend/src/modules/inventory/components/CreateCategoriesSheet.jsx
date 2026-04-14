import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Tags, Type, Check, Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

import { categoryService } from '../services/categoryService';
import { useToast } from "@/hooks/use-toast";

// 🔥 Schema actualizado para soportar el Padre
const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  prefijo: z.string().min(2, "Mínimo 2").max(4, "Máximo 4 letras"),
  categoria_padre_id: z.string().optional().nullable(),
});

const CreateCategorySheet = ({ onCreated, allCategories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    // Por defecto, creamos una categoría principal ("ninguno")
    defaultValues: { nombre: "", prefijo: "", categoria_padre_id: "ninguno" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const dataLimpia = { 
        nombre: values.nombre,
        prefijo: values.prefijo.toUpperCase(),
        // Si eligió "ninguno", mandamos null al backend para que sea un "Padre"
        categoria_padre_id: values.categoria_padre_id === "ninguno" ? null : values.categoria_padre_id
      };
      
      // Llamamos a tu servicio (asegúrate de que el nombre de la función coincida con tu categoryService)
      await categoryService.registrarCategoria(dataLimpia);
      
      toast({ title: "¡Categoría Creada!", description: "Se ha registrado correctamente en el sistema." });
      
      setIsOpen(false);
      form.reset(); // Limpiamos el formulario para la próxima vez
      if (onCreated) onCreated(); // Recargamos la tabla
      
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Filtramos para que solo salgan las categorías principales (sin padre)
  const parentOptions = allCategories.filter(c => !c.categoria_padre_id);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600 bg-blue-50 rounded-md p-1" />
            Crear Categoría
          </SheetTitle>
          <SheetDescription className="text-zinc-600 mt-1">
            Añade una nueva clasificación para organizar tu inventario.
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
                      <Input 
                        placeholder="Ej. Tapicería, Cardio..."
                        className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
                        {...field} 
                      />
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
                      <Input 
                        placeholder="Ej. TAP, CAR..."
                        maxLength={4} 
                        className="pl-9 h-10 uppercase font-mono border-zinc-200 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-zinc-500">
                    Se usará para generar las etiquetas inteligentes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* 🔥 NUEVO CAMPO: Selector de Categoría Padre */}
              <FormField control={form.control} name="categoria_padre_id" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900 flex items-center gap-1">
                    <Network className="w-4 h-4 text-zinc-500"/> Subcategoría de (Opcional):
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Selecciona una categoría padre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ninguno" className="font-semibold text-blue-600">
                        -- Es una Categoría Principal --
                      </SelectItem>
                      {parentOptions.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.nombre} ({parent.prefijo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-zinc-500">
                    Si eliges una, se creará como una rama dentro de esa categoría.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            <div className="border-t border-zinc-200 pt-6 mt-auto flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              
              <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : <><Check className="mr-2 h-5 w-5" /> Crear Categoría</>}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCategorySheet;