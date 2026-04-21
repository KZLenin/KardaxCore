import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wrench, Check, Lock, Unlock, X, ClipboardCheck, DollarSign, Box, Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { maintenanceService } from '../services/maintenanceService';
import { inventoryService } from '../../inventory/services/inventoryService';
import { sparepartsService } from '../services/sparepartsService';

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

  const [repuestosUsados, setRepuestosUsados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [isAddingSpare, setIsAddingSpare] = useState(false);

  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null); // El ítem en pausa
  const [cantidadInput, setCantidadInput] = useState(1);
  const [costoInput, setCostoInput] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { estado: "", diagnostico: "", trabajo_realizado: "", costo_mano_obra: 0, costo_repuestos: 0 },
  });

  // El Súper useEffect para pre-llenar los datos cuando se abre el panel
  useEffect(() => {
    if (ticket && isOpen) {
      sparepartsService.getByOrden(ticket.id).then(setRepuestosUsados);
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

  useEffect(() => {
    const total = repuestosUsados.reduce((acc, curr) => acc + (Number(curr.costo_unitario) * curr.cantidad), 0);
    form.setValue("costo_repuestos", total);
  }, [repuestosUsados, form]);

  const buscarEnInventario = async (query) => {
    setBusqueda(query);
    if (query.length > 2) {
      try {
        const data = await inventoryService.getAll({ buscar: query, es_externo: false });
        setResultados(data.filter(i => i.stock > 0));
      } catch (error) {
        console.error("Error buscando repuestos:", error);
      }
    } else {
      setResultados([]);
    }
  };

  const confirmarRepuesto = async () => {
    if (!repuestoSeleccionado) return;
    try {
      setIsAddingSpare(true);
      
      // Enviamos el item, la cantidad y el costo al backend
      await sparepartsService.agregarARepuesto(
        ticket.id, 
        repuestoSeleccionado.id, 
        cantidadInput, 
        costoInput
      );
      
      const actualizados = await sparepartsService.getByOrden(ticket.id);
      setRepuestosUsados(actualizados);
      
      // Limpiamos todo
      setBusqueda("");
      setResultados([]);
      setRepuestoSeleccionado(null);
      setCantidadInput(1);
      setCostoInput(0);
      
      if (onUpdated) onUpdated(); 
      toast({ title: "Repuesto añadido", description: "Stock descontado y costo sumado." });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al agregar", variant: "destructive" });
    } finally {
      setIsAddingSpare(false);
    }
  };
  

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
      toast({ title: "Error", description: error.message || "Error al actualizar la orden", variant: "destructive" });
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

              {/* === NUEVA SECCIÓN: GESTIÓN DE REPUESTOS === */}
              <div className="space-y-4 border-y border-zinc-200 py-6 my-4 bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-600" /> Repuestos y Suministros
                </h3>

                {isEditing && (
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="Buscar en bodega (SSD, RAM...)" 
                      value={busqueda}
                      onChange={(e) => buscarEnInventario(e.target.value)}
                      className="pl-9 bg-white border-blue-200"
                    />
                    
                    {/* Resultados del Buscador */}
                    {!repuestoSeleccionado && resultados.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {resultados.map(item => (
                          <div 
                            key={item.id} 
                            // 🔥 Aquí cambiamos la acción al hacer clic
                            onClick={() => setRepuestoSeleccionado(item)}
                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                          >
                            <div className="text-xs">
                              <p className="font-bold text-zinc-900">{item.nombre}</p>
                              <p className="text-zinc-500">Stock actual: {item.stock}</p>
                            </div>
                            <Plus className="w-4 h-4 text-blue-600" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🔥 EL MINI-FORMULARIO INTERMEDIO */}
                    {repuestoSeleccionado && (
                      <div className="absolute z-20 w-full mt-1 bg-blue-50 border border-blue-200 rounded-md shadow-lg p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-blue-900">{repuestoSeleccionado.nombre}</p>
                            <p className="text-xs text-blue-700">Stock disponible: {repuestoSeleccionado.stock}</p>
                          </div>
                          <button type="button" onClick={() => setRepuestoSeleccionado(null)}>
                            <X className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-semibold text-zinc-600 uppercase">Cant.</label>
                            <Input 
                              type="number" min="1" max={repuestoSeleccionado.stock}
                              value={cantidadInput === 0 ? '' : cantidadInput}
                              onChange={e => setCantidadInput(Number(e.target.value))} 
                              className="h-8 text-sm bg-white border-blue-200"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-semibold text-zinc-600 uppercase">Precio Unit. ($)</label>
                            <Input 
                              type="number" step="0.01" min="0"
                              value={costoInput === 0 ? '' : costoInput}
                              onChange={e => setCostoInput(Number(e.target.value))} 
                              className="h-8 text-sm bg-white border-blue-200"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="button" 
                          onClick={confirmarRepuesto} 
                          disabled={isAddingSpare}
                          className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-xs text-white shadow-sm"
                        >
                          {isAddingSpare ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar y Descontar Stock"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {repuestosUsados.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No se han registrado repuestos.</p>
                  ) : (
                    repuestosUsados.map((rep) => (
                      <div key={rep.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md border border-zinc-200 text-xs">
                        <span className="font-medium text-zinc-700">{rep.inventario?.nombre} (x{rep.cantidad})</span>
                        <span className="font-mono text-zinc-500">${(Number(rep.costo_unitario) * rep.cantidad).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
                        <Input type="number" step="0.01" className="pl-9 h-10 border-zinc-200 bg-zinc-100/80 text-blue-700 font-bold" {...field} readOnly={true} />
                      </div>
                    </FormControl>
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