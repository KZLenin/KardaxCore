import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Box, Plus, Wrench, AlertTriangle, FileText, Check, Laptop, Scan, X, Camera, Image as ImageIcon } from "lucide-react";

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
  //item_id: z.string().min(1, "Debes seleccionar un equipo"),
  tipo_mantenimiento: z.string().min(1, "Selecciona el tipo"),
  prioridad: z.string().min(1, "Selecciona la prioridad"),
  motivo: z.string().min(10, "Sé más específico (mín. 10 caracteres)"),
});

const CreateTicketSheet = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEquipo, setSelectedEquipo] = useState(null); 
  const [scanningCode, setScanningCode] = useState(""); // Input temporal del escáner
  const [isLoadingScan, setIsLoadingScan] = useState(false);

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { tipo_mantenimiento: "", prioridad: "Media", motivo: "" },
  });

  //Funcion para leer el codigo del scanner y buscar el equipo
  const handleScan = async (e) => {
    // Si presiona 'Enter' (que es lo que hace la pistola al escanear)
    if (e.key === 'Enter') {
      e.preventDefault(); // Evitamos que el formulario se envíe
      if (!scanningCode) return;

      setIsLoadingScan(true);
      setSelectedEquipo(null); // Reseteamos por si acaso

      try {
        const equipoFound = await maintenanceService.lookupEquipoPorScanner(scanningCode);
        setSelectedEquipo(equipoFound); // Guardamos la info completa
        toast({ title: "¡Equipo Encontrado!", description: `${equipoFound.nombre} - [${equipoFound.codigo}]` });
        setScanningCode(""); // Limpiamos el input
      } catch (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
        setScanningCode(""); // Limpiamos el input
      } finally {
        setIsLoadingScan(false);
      }
    }
  };

  const onSubmit = async (values) => {
    console.log("1. Inicia onSubmit");
    if (!selectedEquipo) {
        toast({ title: "Error", description: "Debes escanear un equipo válido primero.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      console.log("2. Creando FormData");
      // Formateamos los datos exactamente como los espera la Base de Datos
      const formData = new FormData();
      formData.append('item_id', selectedEquipo.id);
      formData.append('tipo_mantenimiento', values.tipo_mantenimiento);
      formData.append('prioridad', values.prioridad);
      formData.append('motivo', values.motivo);

      // Si el usuario seleccionó una foto, la metemos a la caja
      if (fotoFile) {
        console.log("3. Adjuntando foto:", fotoFile.name);
        formData.append('foto_ingreso', fotoFile); // Debe llamarse igual que en el backend (upload.single('evidencia'))
      }
      console.log("4. Enviando al backend...");
      await maintenanceService.crearOrden(formData);
      
      toast({ title: "¡Orden Creada!", description: "El equipo ha sido bloqueado y puesto en Mantenimiento." });
      
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated(); // Recarga la tabla de mantenimientos
      
    } catch (error) {
      console.error("❌ Error en onSubmit:", error); // <-- ESTO NOS DIRÁ EL PROBLEMA REAL
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
                {/* 1. ESCANEAR EQUIPO */}
                <div className="space-y-3 bg-white border border-zinc-200 p-4 rounded-md shadow-inner">
                  <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-amber-500" /> Equipo a Intervenir *
                  </label>
                  {/* Si NO hay equipo seleccionado, mostramos el input del escáner */}
                  {!selectedEquipo ? (
                      <div className="relative">
                          <Input 
                              value={scanningCode}
                              onChange={(e) => setScanningCode(e.target.value)}
                              onKeyDown={handleScan} // <--- Escucha el 'Enter'
                              placeholder="Escanea el código de barras aquí... [Enter]"
                              className="h-10 border-amber-300 bg-amber-50 focus:ring-1 focus:ring-amber-500 font-mono text-sm"
                              disabled={isLoadingScan}
                          />
                          {isLoadingScan ? (
                              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-amber-600" />
                          ) : (
                              <Scan className="absolute right-3 top-3 h-4 w-4 text-amber-400" />
                          )}
                      </div>
                ) : (
                    <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-md flex justify-between items-center gap-2">
                        <div>
                            <p className="font-semibold text-zinc-900 text-sm truncate">{selectedEquipo.nombre}</p>
                            <p className="font-mono text-xs text-zinc-500">[{selectedEquipo.codigo}] - {selectedEquipo.sede}</p>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            className="text-zinc-400 hover:text-amber-600 hover:bg-amber-50 shrink-0"
                            onClick={() => setSelectedEquipo(null)} // Resetea el escáner
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
              </div>

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
              {/* === SECCIÓN FOTOGRÁFICA (EVIDENCIA) === */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 mt-6">
                <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-zinc-500" /> Evidencia de Ingreso
                </label>
                
                {!fotoPreview ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-zinc-400" />
                        <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold">Haz clic para subir</span> o arrastra tu foto</p>
                        <p className="text-xs text-zinc-500">PNG, JPG (Máx. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFotoFile(file); // Lo guardamos para el FormData
                            setFotoPreview(URL.createObjectURL(file)); // Magia para mostrar la foto en pantalla
                          }
                        }} 
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100 group shadow-sm">
                    {/* Muestra la vista previa de la foto antes de subirla */}
                    <img src={fotoPreview} alt="Evidencia Preview" className="w-full h-full object-contain" />
                    
                    {/* Botón para eliminar la foto que aparece al pasar el mouse (hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                      >
                        <X className="w-4 h-4 mr-2" /> Quitar Foto
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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