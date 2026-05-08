import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Box, ScanText, Check, Pencil, Lock, Unlock, X, Archive, MapPin, AlignLeft, History, Printer, Hash, Wrench, ImageIcon, UploadCloud, Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; 
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast";

import ItemTimeline from './ItemTimeline';
const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  categoriaId: z.string().min(1, "Requerido"),
  proveedorId: z.string().optional(),
  serieFabricante: z.string().optional(),
  codigoBarras: z.string().optional(),
  cantidadStock: z.coerce.number().min(0, "Debe ser un número válido"), // Puede ser 0 si se agota
  unidadMedida: z.string().min(1, "Requerido"),

  es_externo: z.boolean().default(false),
  clienteId: z.string().optional(),
  sucursalId: z.string().optional(),
  notasIngreso: z.string().optional()
});

const EditItemSheet = ({ item, categorias = [], proveedores = [], clientes = [], sucursales = [], onUpdated, isOpen, setIsOpen }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  //Edicion o Vista
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  //impresion de codgio de barras
  const [cantidadImprimir, setCantidadImprimir] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", categoriaId: "", proveedorId: "", serieFabricante: "", codigoBarras: "", cantidadStock: 1, unidadMedida: "UNIDAD", es_externo: false, clienteId: "", sucursalId: "", notasIngreso: "" },
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagenUrlActual, setImagenUrlActual] = useState(null);
  const fileInputRef = useRef(null);

  const watchUnidad = form.watch("unidadMedida");
  const isExterno = form.watch("es_externo");
  const watchCliente = form.watch("clienteId");

  useEffect(() => {
    if (watchUnidad === 'UNIDAD' || isExterno) {
      form.setValue("cantidadStock", 1); 
    }
  }, [watchUnidad, isExterno, form]);

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

      form.setValue("cantidadStock", item.stock || item.cantidad_stock || 1);
      form.setValue("unidadMedida", item.unidad || item.unidad_medida || "UNIDAD");
      form.setValue("es_externo", !!item.es_externo);
      form.setValue("clienteId", String(item.cliente_id || ""));
      form.setValue("sucursalId", String(item.sucursal_id || ""));
      form.setValue("notasIngreso", item.notas_ingreso || "");

      setImagenUrlActual(item.imagen_url || null);

    } else if (!isOpen) {
      form.reset();
      setIsEditing(false); 
    }
  }, [item, isOpen, form]);

  const onSubmit = async (values) => {

    setIsSubmitting(true);
    try {
      const dataToUpdate = {
        nombre: values.nombre,
        categoria_id: values.categoriaId,
        proveedor_id: values.proveedorId || null,
        serie_fabricante: values.serieFabricante || null,
        codigo_barras: values.codigoBarras || null,
        cantidad_stock: values.cantidadStock, 
        unidad_medida: values.unidadMedida,
        es_externo: values.es_externo,
        cliente_id: values.clienteId || null,
        sucursal_id: values.sucursalId || null,
        notas_ingreso: values.notasIngreso || null
      };

      await inventoryService.actualizarEquipo(item.id, dataToUpdate);
      
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

  const GallerySelector = ({ onSelect }) => {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const loadGaleria = async () => {
      const data = await inventoryService.getGaleriaImagenes();
      setImagenes(data);
      setCargando(false);
    };
    loadGaleria();
  }, []);

  if (cargando) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-blue-600" /></div>;
  if (imagenes.length === 0) return <p className="text-center text-zinc-500 py-8">No hay imágenes en el servidor aún.</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {imagenes.map((img, idx) => (
        <div key={idx} onClick={() => onSelect(img.url)} className="cursor-pointer border rounded-md overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
          <img src={img.url} alt="Galeria" className="w-full h-24 object-cover" />
        </div>
      ))}
    </div>
  );
};

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !item?.id) return;

    setIsUploadingImage(true);
    try {
      const response = await inventoryService.subirImagenEquipo(item.id, file);
      setImagenUrlActual(response.imagen_url); // Actualizamos la vista previa
      toast({ title: "📸 Foto Subida", description: "La imagen se guardó correctamente en el Storage." });
      if (onUpdated) onUpdated(); // Refrescamos la tabla de atrás
    } catch (error) {
      toast({ title: "Error al subir", description: error, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      // Limpiamos el input para que permita subir la misma foto si hubo un error
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const categoriasPrincipales = categorias.filter(c => !c.categoria_padre_id);
  const getSubcategorias = (idPadre) => categorias.filter(c => c.categoria_padre_id === idPadre);
  const sucursalesFiltradas = sucursales.filter(s => s.empresa_id === watchCliente);

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

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

        <div className="flex flex-col items-center justify-center p-6 bg-white border border-zinc-200 border-dashed rounded-xl shadow-sm relative overflow-hidden group">
            {isUploadingImage ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-zinc-600">Procesando imagen...</span>
              </div>
            ) : imagenUrlActual ? (
              <div className="w-full flex flex-col items-center">
                <img src={imagenUrlActual} alt="Equipo" className="w-48 h-48 object-contain rounded-md bg-zinc-50 border border-zinc-100 shadow-sm" />
                <div className="mt-4 absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Subir Nueva
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-6">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
                  <ImageIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600">Sin imagen referencial</p>
                
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Subir Foto
                  </Button>

                  {/* 🔥 BOTÓN Y MODAL DE GALERÍA */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Images className="w-4 h-4 mr-2" /> Galería
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Imágenes Recientes en el Sistema</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <GallerySelector 
                          onSelect={async (url) => {
                            setIsUploadingImage(true);
                            try {
                              // Reutilizamos la ruta de actualización para enlazar la URL existente
                              await inventoryService.actualizarEquipo(item.id, { imagen_url: url });
                              setImagenUrlActual(url);
                              toast({ title: "Imagen enlazada", description: "Se ha vinculado la imagen al equipo." });
                              if(onUpdated) onUpdated();
                            } catch (error) {
                              toast({ title: "Error", description: "No se pudo enlazar la imagen.", variant: "destructive" });
                            } finally {
                              setIsUploadingImage(false);
                            }
                          }} 
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errores) => {
              console.error("🛑 ZOD BLOQUEÓ EL ENVÍO. Aquí está el error:", errores);
            })} className="space-y-6 p-6">
              
              {/* 🔥 IDENTIFICADOR VISUAL DE TALLER (Solo Lectura, por seguridad) */}
              {isExterno && (
                <div className="flex items-center gap-3 p-3 bg-orange-100/80 border border-orange-200 rounded-md text-orange-800">
                  <Wrench className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Equipo de Cliente (Taller)</span>
                    <span className="text-xs opacity-80">El origen de este equipo está bloqueado por seguridad.</span>
                  </div>
                </div>
              )}
              
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
                  <FormField control={form.control} name="categoriaId" render={({ field }) => {
                    
                    const categoriasPrincipales = categorias.filter(c => !c.categoria_padre_id);
                    const getSubcategorias = (idPadre) => categorias.filter(c => c.categoria_padre_id === idPadre);

                    return (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-semibold text-zinc-900">Categoría *</FormLabel>
                        <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger className={`h-10 border-zinc-200 ${!isEditing ? "bg-zinc-100/50 text-zinc-700 opacity-100" : "bg-white focus:ring-1 focus:ring-blue-500"}`}>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriasPrincipales.map(padre => (
                              <SelectGroup key={padre.id}>
                                <SelectLabel className="font-bold text-blue-800 bg-blue-50/50">{padre.nombre}</SelectLabel>
                                <SelectItem value={padre.id.toString()} className="pl-6 font-semibold text-zinc-700">
                                  {padre.nombre} (General)
                                </SelectItem>
                                {getSubcategorias(padre.id).map(hijo => (
                                  <SelectItem key={hijo.id} value={hijo.id.toString()} className="pl-8 text-zinc-600">
                                    ↳ {hijo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />

                  {!isExterno ? (
                    <FormField control={form.control} name="proveedorId" render={({ field }) => (
                      <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold">Proveedor</FormLabel>
                        <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl><SelectTrigger className={`h-10 ${!isEditing ? "bg-zinc-100/50" : "bg-white"}`}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{proveedores.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre_empresa}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                  ) : (
                    <FormField control={form.control} name="clienteId" render={({ field }) => (
                      <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Cliente Dueño</FormLabel>
                        <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl><SelectTrigger className={`h-10 border-orange-200 ${!isEditing ? "bg-orange-50/50" : "bg-white"}`}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre_comercial}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>

                {isExterno && (
                  <div className="space-y-4 p-4 border border-orange-200 bg-orange-50/30 rounded-md">
                    <FormField control={form.control} name="sucursalId" render={({ field }) => (
                      <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Sucursal de Origen</FormLabel>
                        <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl><SelectTrigger className={`h-10 border-orange-200 ${!isEditing ? "bg-transparent" : "bg-white"}`}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{sucursalesFiltradas.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="notasIngreso" render={({ field }) => (
                      <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Notas de Recepción</FormLabel>
                        <FormControl>
                          <Textarea readOnly={!isEditing} className={`border-orange-200 resize-none ${!isEditing ? "bg-transparent" : "bg-white"}`} {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

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
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <FormField control={form.control} name="cantidadStock" render={({ field }) => {
                    const esUnidad = watchUnidad === 'UNIDAD' || isExterno;
                    const isInputReadOnly = !isEditing || esUnidad;

                    let dynamicClass = "pl-9 h-10 border-zinc-200 shadow-sm ";
                    if (!isEditing) {
                      dynamicClass += "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0 ";
                    } else if (esUnidad) {
                      dynamicClass += "bg-zinc-100 text-zinc-500 cursor-not-allowed focus-visible:ring-0 ";
                    } else {
                      dynamicClass += "focus:ring-1 focus:ring-blue-500 bg-white ";
                    }

                    return (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-sm font-semibold text-zinc-900">Stock Actual</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input 
                              type="number" 
                              className={dynamicClass} 
                              {...field} 
                              readOnly={isInputReadOnly}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        {isEditing && esUnidad && (
                          <FormDescription className="text-[10px] text-amber-600 font-medium leading-tight">
                            Bloqueado a 1 para UNIDAD.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }} />

                  <FormField control={form.control} name="unidadMedida" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-zinc-900">Unidad de Medida</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing || isExterno}>
                        <FormControl>
                          <SelectTrigger className={`h-10 border-zinc-200 ${!isEditing || isExterno ? "bg-zinc-100/50 text-zinc-700 opacity-100" : "bg-white focus:ring-1 focus:ring-blue-500"}`}>
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