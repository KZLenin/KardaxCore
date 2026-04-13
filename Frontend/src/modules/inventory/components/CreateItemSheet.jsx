import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Box, ScanText, User, Hash, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast"; //

// 1. EL BLINDAJE (Mismo Zod Schema)
const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  categoriaId: z.string().min(1, "Requerido"),
  proveedorId: z.string().optional(),
  serieFabricante: z.string().optional(),
  codigoBarras: z.string().optional(),
  cantidadStock: z.coerce.number().min(1, "Mínimo 1"),
  unidadMedida: z.string().min(1, "Requerido"),
});

const CreateItemSheet = ({ categorias = [], proveedores = [], onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // 2. INICIALIZAR EL FORMULARIO (Mismos defaults)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      categoriaId: "",
      proveedorId: "",
      serieFabricante: "",
      codigoBarras: "",
      cantidadStock: 1,
      unidadMedida: "UNIDAD",
    },
  });
  //Forzar 1 unidad si el usuario selecciona "UNIDAD" o "U"
  const watchUnidad = form.watch("unidadMedida");
  useEffect(() => {
  if (watchUnidad === 'Unidad' || watchUnidad === 'UNIDAD') {
    form.setValue("cantidadStock", 1); // Forzamos el valor en el formulario
  }
}, [watchUnidad, form]);

  // 3. LA FUNCIÓN DE GUARDADO (Misma lógica)
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await inventoryService.registrarEntrada(values);
      // Aquí llamaríamos a la función del toast para mostrar el éxito, ej:
      toast({ title: "¡Éxito!", description: "El artículo ha sido registrado." });
      
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
      
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Botón de Activación (Más elegante) */}
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
        <Plus className="w-4 h-4 mr-2" /> Registrar Entrada
      </Button>
      
      {/* Panel Lateral (Con espacio y scroll) */}
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0">
        
        {/* Cabecera Premium (Fija arriba) */}
        <div className="bg-white p-6 border-b border-zinc-200 space-y-1">
          <SheetTitle className="text-2xl font-bold text-zinc-950">Nuevo Artículo en Kardex</SheetTitle>
          <SheetDescription className="text-zinc-600">
            Registra un nuevo equipo o material en el inventario de SOI Soluciones.
          </SheetDescription>
        </div>

        {/* Formulario (Con padding y espaciado consistente) */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            
            {/* 1. Descripción Principal */}
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">Descripción del Artículo *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Box className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Ej. Switch Cisco 48 Puertos PoE" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-zinc-500">Ej. Laptop HP Pavilion, Bobina Cable UTP, etc.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            {/* 2. Categoría y Proveedor (Grouped en grid con mejor separación) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <FormField control={form.control} name="categoriaId" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="proveedorId" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Proveedor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {proveedores.map(prov => (
                        <SelectItem key={prov.id} value={prov.id.toString()}>{prov.nombre_empresa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* 3. Identificadores (S/N) */}
            <FormField control={form.control} name="serieFabricante" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-zinc-900">Número de Serie (Fabricante)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <ScanText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Ej. ABC123456789 (Opcional)" className="pl-9 h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* 4. Stock Inicial y Unidad (Grouped en grid con mejor separación) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <FormField control={form.control} name="cantidadStock" render={({ field }) => {
                // 🔥 3. LA MAGIA VISUAL: Evaluamos si está en unidad
                const esUnidad = watchUnidad === 'UNIDAD';

                return (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Stock Inicial</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        className={`h-10 border-zinc-200 shadow-sm ${esUnidad ? "bg-zinc-100 text-zinc-500 cursor-not-allowed focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`} 
                        {...field} 
                        readOnly={esUnidad}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    {esUnidad ? (
                      <FormDescription className="text-[10px] text-amber-600 font-medium leading-tight">
                        Bloqueado a 1 para equipos individuales.
                      </FormDescription>
                    ) : (
                      <FormDescription className="text-xs text-zinc-500">Cantidad con la que entra.</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }} />

              <FormField control={form.control} name="unidadMedida" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Unidad de Medida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                      <SelectItem value="CAJA">CAJA</SelectItem>
                      <SelectItem value="METRO">METRO</SelectItem>
                      <SelectItem value="ROLLO">ROLLO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Separador sutil */}
            <div className="border-t border-zinc-200 pt-6"></div>

            {/* Botón de Guardado (Fijo abajo con espacio) */}
            <SheetFooter className="mt-8">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-base font-semibold transition-all hover:scale-[1.01]" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar en Inventario</>}
              </Button>
            </SheetFooter>

          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateItemSheet;