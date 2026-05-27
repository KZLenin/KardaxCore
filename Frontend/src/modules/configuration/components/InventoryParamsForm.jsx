import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Box, Pencil, Unlock, X, Check, Hash, ScanText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { configurationService } from '../services/configurationService';

const formSchema = z.object({
  stock_critico_global: z.coerce.number().min(0, "No puede ser negativo"),
  prefijo_codigo: z.string().min(1, "Requerido").max(5, "Máximo 5 letras")
});

export const InventoryParamsForm = ({ configInicial, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { stock_critico_global: 5, prefijo_codigo: "EQ" },
  });

  useEffect(() => {
    if (configInicial) {
      form.setValue("stock_critico_global", configInicial.stock_critico_global || 5);
      form.setValue("prefijo_codigo", configInicial.prefijo_codigo || "EQ");
    }
  }, [configInicial, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await configurationService.actualizarInventario(values);
      toast({ title: "¡Guardado!", description: "Parámetros de inventario actualizados." });
      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al guardar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Restauramos los valores originales si cancela
    form.setValue("stock_critico_global", configInicial?.stock_critico_global || 5);
    form.setValue("prefijo_codigo", configInicial?.prefijo_codigo || "EQ");
    setIsEditing(false);
  };

  // Clases dinámicas calcadas de tu diseño
  const inputDinámico = `pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      
      {/* HEADER CON BOTÓN DE DESBLOQUEO */}
      <div className="bg-zinc-50/80 p-5 border-b border-zinc-200 flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Box className="w-5 h-5 text-zinc-700" />}
            {isEditing ? "Editando Parámetros" : "Parámetros de Inventario"}
          </h3>
          <p className="text-sm text-zinc-500">Configura las reglas globales del Kardex Core.</p>
        </div>
        
        {!isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" size="sm">
            <Unlock className="w-4 h-4 mr-2" /> Editar
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FormField control={form.control} name="stock_critico_global" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">Alerta de Stock Crítico</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input type="number" className={inputDinámico} {...field} readOnly={!isEditing} />
                  </div>
                </FormControl>
                <p className="text-xs text-zinc-500">El sistema avisará cuando un ítem baje de esta cantidad.</p>
                <FormMessage />
              </FormItem>
            )} />

            

          </div>

          {/* FOOTER DE ACCIONES */}
          {isEditing && (
            <div className="border-t border-zinc-200 pt-6 mt-4 flex gap-3 justify-end">
              <Button type="button" variant="outline" className="h-10" onClick={handleCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit" className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar Cambios</>}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};