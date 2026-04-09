import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Box, ScanText, Check, Pencil, Lock, Unlock, X, Archive, MapPin, AlignLeft, History, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast";

import ItemTimeline from './ItemTimeline';
const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  categoriaId: z.string().min(1, "Requerido"),
  proveedorId: z.string().optional(),
  serieFabricante: z.string().optional(),
  codigoBarras: z.string().optional(),
});

const EditItemSheet = ({ item, categorias = [], proveedores = [], onUpdated, isOpen, setIsOpen }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  //Edicion o Vista
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  //impresion de codgio de barras
  const [cantidadImprimir, setCantidadImprimir] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", categoriaId: "", proveedorId: "", serieFabricante: "", codigoBarras: "" },
  });

  useEffect(() => {
    if (item && isOpen) {
      // 1. Nombre
      form.setValue("nombre", item.nombre || "");
      
      // 2. Categoría
      const idCat = item.cat_id || item.categoria_id || item.categoriaId;
      if (idCat) form.setValue("categoriaId", String(idCat));

      // 3. Proveedor
      const idProv = item.prov_id || item.proveedor_id || item.proveedorId;
      if (idProv && idProv !== "null") {
        form.setValue("proveedorId", String(idProv));
      } else {
        form.setValue("proveedorId", "");
      }

      // 4. Serie Fabricante
      form.setValue("serieFabricante", item.serie_fabricante || item.serieFabricante || "");

      // 5. Código de Barras
      const codigoSistema = item.codigo_barras || item.codigo || "";
      form.setValue("codigoBarras", codigoSistema === "S/N" ? "" : codigoSistema);
      
    } else if (!isOpen) {
      form.reset();
      // 🔥 Volvemos a bloquear todo cuando se cierra el panel
      setIsEditing(false); 
    }
  }, [item, isOpen, form]);

  const onSubmit = async (values) => {
    // 📸 CÁMARA 1: Si ves esto, Zod dejó pasar los datos
    console.log("✅ 1. Zod validó todo correctamente. Valores:", values);

    setIsSubmitting(true);
    try {
      const dataToUpdate = {
        nombre: values.nombre,
        categoria_id: values.categoriaId,
        proveedor_id: values.proveedorId || null,
        serie_fabricante: values.serieFabricante || null,
        codigo_barras: values.codigoBarras || null
      };

      // 📸 CÁMARA 2: Esto es exactamente lo que viaja por internet
      console.log("🚀 2. Payload empaquetado para el Backend:", dataToUpdate);

      await inventoryService.actualizarEquipo(item.id, dataToUpdate);
      
      // 📸 CÁMARA 3: Si ves esto, el Backend guardó y devolvió un OK
      console.log("✅ 3. El Backend guardó los datos y respondió 200 OK.");

      toast({ title: "¡Actualizado!", description: "El equipo ha sido modificado con éxito." });
      
      setIsEditing(false); 
      setIsOpen(false);
      if (onUpdated) onUpdated();
      
    } catch (error) {
      console.error("❌ ERROR EN LA PETICIÓN AL BACKEND:", error);
      toast({ title: "Error", description: error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImprimirEtiquetas = async () => {
    if (!item?.id) return;
    
    setIsPrinting(true);
    try {
      // 1. Pedimos el PDF al Backend
      const pdfBlob = await inventoryService.descargarEtiquetasPDF(item.id, cantidadImprimir);
      
      // 2. Creamos una URL temporal en la memoria del navegador
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // 3. Abrimos el PDF en una pestaña nueva para que el usuario imprima
      window.open(pdfUrl, '_blank');
      
      // (Opcional) Limpiamos la URL después de unos segundos para no llenar la RAM
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
      toast({ title: "¡PDF Generado!", description: `Etiquetas listas para imprimir.` });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER CON BOTÓN DE EDICIÓN */}
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-start sticky top-0 z-10 shadow-sm">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Box className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Equipo" : "Detalles del Equipo"}
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              {isEditing ? "Modifica los datos y guarda los cambios." : "Información completa registrada en el sistema."}
            </SheetDescription>
          </div>
          
          {/* BOTÓN MÁGICO QUE CAMBIA EL ESTADO */}
          {!isEditing && (
            <Button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setIsEditing(true); }} 
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              size="sm"
            >
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errores) => {
    console.error("🛑 ZOD BLOQUEÓ EL ENVÍO. Aquí está el error:", errores);
  })} className="space-y-6 p-6">
              
              {/* === SECCIÓN 1: DATOS EDITABLES === */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> Datos Generales
                </h3>

                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Descripción del Artículo *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Box className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input 
                          className={`pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`} 
                          {...field} 
                          readOnly={!isEditing} // Bloqueo funcional
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <FormField control={form.control} name="categoriaId" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-zinc-900">Categoría *</FormLabel>
                      <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className={`h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 opacity-100" : "bg-white focus:ring-1 focus:ring-blue-500"}`}>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="proveedorId" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-zinc-900">Proveedor</FormLabel>
                      <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className={`h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 opacity-100" : "bg-white focus:ring-1 focus:ring-blue-500"}`}>
                            <SelectValue placeholder="Opcional" />
                          </SelectTrigger>
                        </FormControl>
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

                <FormField control={form.control} name="serieFabricante" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Número de Serie</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ScanText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input 
                          className={`pl-9 h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`} 
                          {...field} 
                          readOnly={!isEditing}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* === SECCIÓN 2: DATOS BLOQUEADOS DEL SISTEMA === */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Datos de Sistema (Solo Lectura)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Stock Actual</label>
                    <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-2 rounded-md">
                      <Archive className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-900">{item?.stock || 0}</span>
                      <span className="text-xs text-zinc-500 uppercase">{item?.unidad || 'UNIDAD'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Sede Registrada</label>
                    <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-2 rounded-md">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-900 truncate">{item?.sede || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <FormField control={form.control} name="codigoBarras" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-zinc-500">Código de Barras Interno</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ScanText className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input 
                          className="pl-9 h-9 border-zinc-200 bg-zinc-100 text-zinc-600 font-mono text-sm cursor-not-allowed focus-visible:ring-0" 
                          {...field} 
                          readOnly 
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                
                {/* Notas / Detalles (Si existen) */}
                {item?.detalles?.nota && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Notas Adicionales</label>
                    <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-200/50 px-3 py-2 rounded-md">
                      <AlignLeft className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-900 italic">{item.detalles.nota}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN DE IMPRESIÓN INDUSTRIAL */}
                <div className="col-span-2 mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Etiquetas Físicas</h4>
                    <p className="text-xs text-zinc-500">Genera el PDF calibrado para la impresora térmica (58x40mm).</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Cantidad</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="500"
                        value={cantidadImprimir}
                        onChange={(e) => setCantidadImprimir(e.target.value)}
                        className="w-20 h-9 text-center font-mono bg-white"
                        disabled={isPrinting}
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      className="h-9 mt-4 bg-zinc-900 hover:bg-zinc-800 text-white"
                      onClick={handleImprimirEtiquetas}
                      disabled={isPrinting}
                    >
                      {isPrinting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</>
                      ) : (
                        <><Printer className="w-4 h-4 mr-2" /> Imprimir</>
                      )}
                    </Button>
                  </div>
                </div>

              {/* === FOOTER DE ACCIONES === */}
              {isEditing && (
                <div className="border-t border-zinc-200 pt-6 mt-8 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-11"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-5 w-5" /> Guardar</>}
                  </Button>
                </div>
              )}

              <div className="space-y-4 pt-6 border-t border-zinc-200 mt-8">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <History className="w-4 h-4" /> Historial de Vida
              </h3>
              
              {/* Aquí metemos la línea de tiempo, solo si el equipo ya existe */}
              {item?.id && <ItemTimeline itemId={item.id} />}
            </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditItemSheet;