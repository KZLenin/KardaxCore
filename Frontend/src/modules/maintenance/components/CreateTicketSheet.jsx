import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Wrench, AlertTriangle, FileText, Check, Laptop } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { maintenanceService } from '../services/maintenanceService';
import { useToast } from "@/hooks/use-toast";

// Validaciones estrictas: Un ticket mal hecho es un dolor de cabeza futuro
const formSchema = z.object({
  item_id: z.string().min(1, "Debes seleccionar un equipo"),
  tipo_mantenimiento: z.string().min(1, "Selecciona el tipo"),
  prioridad: z.string().min(1, "Selecciona la prioridad"),
  motivo: z.string().min(10, "Sé más específico (mín. 10 caracteres)"),
});

const CreateTicketSheet = ({ equipos = [], onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { item_id: "", tipo_mantenimiento: "", prioridad: "Media", motivo: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Formateamos los datos exactamente como los espera la Base de Datos
      const payload = {
        item_id: values.item_id,
        tipo_mantenimiento: values.tipo_mantenimiento,
        prioridad: values.prioridad,
        motivo: values.motivo,
        // OJO: Si tu DB exige "creado_por", y tu backend no lo saca del token aún, 
        // tendrías que enviar un ID de usuario quemado por ahora para probar:
        // creado_por: "TU-UUID-DE-USUARIO-AQUI" 
      };

      await maintenanceService.crearOrden(payload);
      
      toast({ title: "¡Orden Creada!", description: "El equipo ha sido bloqueado y puesto en Mantenimiento." });
      
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated(); // Recarga la tabla de mantenimientos
      
    } catch (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
        <Wrench className="w-4 h-4 mr-2" /> Nueva Orden de Trabajo
      </Button>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 space-y-1 sticky top-0 z-10">
          <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" /> Nuevo Ticket
          </SheetTitle>
          <SheetDescription className="text-zinc-600">
            Registra un daño, mantenimiento preventivo o instalación. El equipo quedará bloqueado en el inventario.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              
              {/* 1. SELECCIÓN DE EQUIPO */}
              <FormField control={form.control} name="item_id" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-zinc-500" /> Equipo a Intervenir *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-zinc-200 bg-white focus:ring-1 focus:ring-amber-500">
                        <SelectValue placeholder="Busca un equipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Aquí mostramos solo los equipos que pasemos por props */}
                      {equipos.map(eq => (
                        <SelectItem key={eq.id} value={eq.id.toString()}>
                          <span className="font-mono text-xs text-zinc-400 mr-2">[{eq.codigo}]</span>
                          {eq.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                {/* 2. TIPO DE MANTENIMIENTO */}
                <FormField control={form.control} name="tipo_mantenimiento" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Tipo de Trabajo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-zinc-200 bg-white focus:ring-1 focus:ring-amber-500">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Correctivo">Correctivo (Reparación)</SelectItem>
                        <SelectItem value="Preventivo">Preventivo (Limpieza/Ajuste)</SelectItem>
                        <SelectItem value="Instalación">Instalación / Armado</SelectItem>
                        <SelectItem value="Inspección">Inspección Técnica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 3. PRIORIDAD */}
                <FormField control={form.control} name="prioridad" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Prioridad *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-zinc-200 bg-white focus:ring-1 focus:ring-amber-500">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Baja">🟢 Baja (Rutina)</SelectItem>
                        <SelectItem value="Media">🟡 Media (Normal)</SelectItem>
                        <SelectItem value="Alta">🟠 Alta (Afecta operación)</SelectItem>
                        <SelectItem value="Urgente">🔴 Urgente (Crítico)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* 4. MOTIVO / DETALLE DEL DAÑO */}
              <FormField control={form.control} name="motivo" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-500" /> Motivo del Ingreso *
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej. El cliente reporta que la caminadora hace un ruido metálico al subir de 5km/h..." 
                      className="min-h-[120px] resize-none border-zinc-200 bg-white focus:ring-1 focus:ring-amber-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="border-t border-zinc-200 pt-6 mt-8">
                <Button type="submit" className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white shadow-md text-base font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando Ticket...</> : <><Check className="mr-2 h-5 w-5" /> Crear Orden de Trabajo</>}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateTicketSheet;