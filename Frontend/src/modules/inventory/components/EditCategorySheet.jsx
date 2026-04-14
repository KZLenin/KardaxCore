import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Tags, Type, Check, Pencil, Unlock, X, Network } from "lucide-react"; // Añadí Network para el icono

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
// 🔥 Importamos el Select de Shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

import { categoryService } from '../services/categoryService';
import { useToast } from "@/hooks/use-toast";

// 🔥 Actualizamos el schema para aceptar categoria_padre_id
const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  prefijo: z.string().min(2, "Mínimo 2").max(4, "Máximo 4 letras"),
  categoria_padre_id: z.string().optional().nullable(),
});

// 🔥 Recibimos allCategories por props
const EditCategorySheet = ({ category, isOpen, setIsOpen, onUpdated, allCategories = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", prefijo: "", categoria_padre_id: "ninguno" },
  });

  useEffect(() => {
    if (category && isOpen) {
      form.setValue("nombre", category.nombre || "");
      form.setValue("prefijo", category.prefijo || "");
      // Si tiene padre lo ponemos, si no, seteamos "ninguno"
      form.setValue("categoria_padre_id", category.categoria_padre_id || "ninguno");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [category, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const dataLimpia = { 
        ...values, 
        prefijo: values.prefijo.toUpperCase(),
        // Si eligió "ninguno", mandamos null al backend
        categoria_padre_id: values.categoria_padre_id === "ninguno" ? null : values.categoria_padre_id
      };
      
      await categoryService.actualizarCategoria(category.id, dataLimpia);
      toast({ title: "¡Actualizado!", description: "La categoría se modificó correctamente." });
      
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
      
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Filtramos las categorías para el dropdown:
  // 1. Solo categorías principales (sin padre) para mantener solo 2 niveles.
  // 2. Excluimos la categoría actual para que no se asigne a sí misma.
  const parentOptions = allCategories.filter(c => !c.categoria_padre_id && c.id !== category?.id);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start sticky top-0 z-10 shadow-sm">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Tags className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Categoría" : "Detalles"}
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              {isEditing ? "Modifica los datos y guarda." : "Información de la clasificación."}
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
              
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Nombre de la Categoría *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Tags className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input 
                        className={`pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"}`}
                        {...field} 
                        readOnly={!isEditing} 
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
                        maxLength={4} 
                        className={`pl-9 h-10 uppercase font-mono border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"}`}
                        {...field} 
                        readOnly={!isEditing}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* 🔥 NUEVO CAMPO: Selector de Categoría Padre */}
              <FormField control={form.control} name="categoria_padre_id" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900 flex items-center gap-1">
                    <Network className="w-4 h-4 text-zinc-500"/> Subcategoría de:
                  </FormLabel>
                  <Select 
                    disabled={!isEditing} 
                    onValueChange={field.onChange} 
                    value={field.value || "ninguno"}
                  >
                    <FormControl>
                      <SelectTrigger className={`h-10 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default" : "bg-white"}`}>
                        <SelectValue placeholder="Selecciona una categoría padre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ninguno" className="font-semibold text-blue-600">
                        -- Categoría Principal (Sin Padre) --
                      </SelectItem>
                      {parentOptions.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.nombre} ({parent.prefijo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-zinc-500">
                    Si seleccionas una categoría aquí, esta se convertirá en una subcategoría.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

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

export default EditCategorySheet;