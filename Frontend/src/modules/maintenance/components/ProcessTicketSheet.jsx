import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wrench, Check, Lock, Unlock, X, ClipboardCheck, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { maintenanceService } from '../services/maintenanceService';
import { useToast } from "@/hooks/use-toast";

// Zod coerce ayuda a transformar los inputs de texto a números para la BD
const formSchema = z.object({
  estado: z.string().min(1, "Requerido"),
  diagnostico: z.string().optional(),
  trabajo_realizado: z.string().optional(),
  costo_mano_obra: z.coerce.number().min(0).optional(),
  costo_repuestos: z.coerce.number().min(0).optional(),
});

const ProcessTicketSheet = ({ ticket, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { estado: "", diagnostico: "", trabajo_realizado: "", costo_mano_obra: 0, costo_repuestos: 0 },
  });

  // El Súper useEffect para pre-llenar los datos cuando se abre el panel
  useEffect(() => {
    if (ticket && isOpen) {
      form.setValue("estado", ticket.estado || "Pendiente");
      form.setValue("diagnostico", ticket.diagnostico || "");
      form.setValue("trabajo_realizado", ticket.trabajo_realizado || "");
      form.setValue("costo_mano_obra", ticket.costo_mano_obra || 0);
      form.setValue("costo_repuestos", ticket.costo_repuestos || 0);
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [ticket, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        estado: values.estado,
        diagnostico: values.diagnostico,
        trabajo_realizado: values.trabajo_realizado,
        costo_mano_obra: values.costo_mano_obra,
        costo_repuestos: values.costo_repuestos,
        // OJO AQUÍ: Mandamos el item_id para que el backend sepa a quién desbloquear
        item_id: ticket.item_id 
      };

      await maintenanceService.actualizarOrden(ticket.id, payload);
      
      toast({ title: "¡Ticket Actualizado!", description: "La orden se procesó correctamente." });
      
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
      
    } catch (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start sticky top-0 z-10 shadow-sm">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" /> Procesar Ticket
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              {ticket?.equipo_nombre} - {ticket?.codigo_equipo}
            </SheetDescription>
          </div>
          
          {!isEditing && (
            <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" size="sm">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* SECCIÓN SOLO LECTURA: Lo que reportó el cliente/creador */}
          <div className="p-6 bg-zinc-100/50 border-b border-zinc-200 space-y-3">
             <h3 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                <Lock className="w-3 h-3" /> Reporte Inicial
             </h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="font-semibold text-zinc-700">Tipo:</span> {ticket?.tipo}</div>
               <div><span className="font-semibold text-zinc-700">Prioridad:</span> {ticket?.prioridad}</div>
             </div>
             <div>
                <span className="font-semibold text-zinc-700 text-sm">Motivo:</span>
                <p className="text-sm text-zinc-600 mt-1 italic">"{ticket?.motivo}"</p>
             </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              
              {/* === DATOS DEL TÉCNICO === */}
              <FormField control={form.control} name="estado" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Estado del Ticket *</FormLabel>
                  <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className={`h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white focus:ring-1 focus:ring-blue-500"}`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Revisión">En Revisión</SelectItem>
                      <SelectItem value="Esperando Repuestos">Esperando Repuestos</SelectItem>
                      <SelectItem value="Finalizado">Finalizado (Liberar Equipo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="diagnostico" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Diagnóstico Técnico</FormLabel>
                  <FormControl>
                    <Textarea className={`min-h-[80px] resize-none border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default" : "bg-white focus:ring-1 focus:ring-blue-500"}`} {...field} readOnly={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="trabajo_realizado" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Trabajo Realizado</FormLabel>
                  <FormControl>
                    <Textarea className={`min-h-[80px] resize-none border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default" : "bg-white focus:ring-1 focus:ring-blue-500"}`} {...field} readOnly={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="costo_mano_obra" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Mano de Obra ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input type="number" step="0.01" className={`pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white focus:ring-1 focus:ring-blue-500"}`} {...field} readOnly={!isEditing} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="costo_repuestos" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Repuestos ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input type="number" step="0.01" className={`pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700" : "bg-white focus:ring-1 focus:ring-blue-500"}`} {...field} readOnly={!isEditing} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {isEditing && (
                <div className="border-t border-zinc-200 pt-6 mt-8 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar</>}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProcessTicketSheet;