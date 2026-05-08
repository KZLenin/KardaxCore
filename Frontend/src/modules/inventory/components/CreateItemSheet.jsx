import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Box, ScanText, User, Hash, Check, Wrench, AlertTriangle, ImageIcon, UploadCloud, Images, X   } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast"; //


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
// 1. EL BLINDAJE (Mismo Zod Schema)

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  sedeId: z.string().min(1, "Bodega requerida"),
  categoriaId: z.string().min(1, "Requerido"),
  proveedorId: z.string().optional(),
  serieFabricante: z.string().optional(),
  codigoBarras: z.string().optional(),
  cantidadStock: z.coerce.number().min(1, "Mínimo 1"),
  unidadMedida: z.string().min(1, "Requerido"),
  es_externo: z.boolean().default(false),
  clienteId: z.string().optional(),
  sucursalId: z.string().optional(),
  prioridad: z.string().default("Media"),
  tipoMantenimiento: z.string().default("Correctivo"),
  notasIngreso: z.string().optional()
});


const CreateItemSheet = ({ sedes = [], categorias = [], proveedores = [], clientes = [], sucursales = [], onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // 2. INICIALIZAR EL FORMULARIO (Mismos defaults)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      sedeId: "",
      categoriaId: "",
      proveedorId: "",
      serieFabricante: "",
      codigoBarras: "",
      cantidadStock: 1,
      unidadMedida: "UNIDAD",
      es_externo: false, 
      clienteId: "", 
      sucursalId: "",
      prioridad: "Media",
      tipoMantenimiento: "Correctivo", 
      notasIngreso: ""
    },
  });

  const watchUnidad = form.watch("unidadMedida");
  const isExterno = form.watch("es_externo");
  const watchCliente = form.watch("clienteId");

  useEffect(() => {
  if (isExterno) {
      form.setValue("cantidadStock", 1); 
      form.setValue("proveedorId", ""); // Limpia proveedor
    } else {
      form.setValue("clienteId", "");
      form.setValue("sucursalId", "");
    }
  }, [isExterno, form]);

  useEffect(() => {
    if (!isOpen) {
      setImagenFile(null);
      setImagenPreview(null);
      form.reset();
    }
  }, [isOpen, form]);


 // 3. LA FUNCIÓN DE GUARDADO
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // PASO 1: Creamos el o los equipos en la Base de Datos
      const respuestaBackend = await inventoryService.registrarEntrada(values);
      
      // 🔥 EL FIX ESTÁ AQUÍ: Extraemos el array real que viene dentro de "item"
      const itemsCreados = respuestaBackend.item; 

      // PASO 2: El modo silencioso para la foto
      if (itemsCreados && itemsCreados.length > 0 && (imagenFile || imagenPreview)) {
        const primerEquipoId = itemsCreados[0].id;
        let urlFinalParaTodos = null;

        if (imagenFile) {
          // A. Si es un archivo nuevo, lo subimos amarrado al primer equipo
          const responseImagen = await inventoryService.subirImagenEquipo(primerEquipoId, imagenFile);
          urlFinalParaTodos = responseImagen.imagen_url;
        } else if (imagenPreview) {
          // B. Si es de la galería, solo guardamos el texto de la URL
          urlFinalParaTodos = imagenPreview;
          await inventoryService.actualizarEquipo(primerEquipoId, { imagen_url: urlFinalParaTodos });
        }

        // C. Si el bucle clonó equipos (ej. creaste 5 teclados), les copiamos la URL a los demás
        if (urlFinalParaTodos && itemsCreados.length > 1) {
          const promesasClones = itemsCreados.slice(1).map(item => 
            inventoryService.actualizarEquipo(item.id, { imagen_url: urlFinalParaTodos })
          );
          await Promise.all(promesasClones); // Ejecutamos todas las actualizaciones en paralelo
        }
      }

      toast({ title: "¡Éxito!", description: "El artículo y su imagen han sido registrados." }); 

      setIsOpen(false);
      if (onCreated) onCreated();   
    } catch (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file)); // Crea una URL local temporal para la preview
    }
  };

  const [imagenFile, setImagenFile] = useState(null); // El archivo físico si lo sube
  const [imagenPreview, setImagenPreview] = useState(null); // La URL para previsualizar (física o de galería)
  const fileInputRef = useRef(null);

  const categoriasPrincipales = categorias.filter(c => !c.categoria_padre_id);
  const getSubcategorias = (idPadre) => categorias.filter(c => c.categoria_padre_id === idPadre);
  const sucursalesFiltradas = sucursales.filter(s => s.empresa_id === watchCliente);

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

            <div className="flex flex-col items-center justify-center p-6 bg-white border border-zinc-200 border-dashed rounded-xl shadow-sm relative overflow-hidden group">
              {imagenPreview ? (
                <div className="w-full flex flex-col items-center">
                  <img src={imagenPreview} alt="Preview" className="w-48 h-48 object-contain rounded-md bg-zinc-50 border border-zinc-100 shadow-sm" />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => { setImagenPreview(null); setImagenFile(null); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-600">Añadir foto representativa</p>
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="w-4 h-4 mr-2" /> Subir
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Images className="w-4 h-4 mr-2" /> Galería
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Imágenes Recientes</DialogTitle></DialogHeader>
                        <GallerySelector onSelect={(url) => {
                          setImagenPreview(url);
                          setImagenFile(null); // Borramos el físico porque seleccionó de la galería
                          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); // Truco para cerrar el modal de shadcn
                        }} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
              {/* Input oculto */}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </div>

            <FormField control={form.control} name="es_externo" render={({ field }) => (
              <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm transition-colors ${field.value ? 'bg-orange-50 border-orange-200' : 'bg-white border-zinc-200'}`}>
                <div className="space-y-0.5">
                  <FormLabel className={`text-base font-bold flex items-center gap-2 ${field.value ? 'text-orange-900' : 'text-zinc-900'}`}>
                    <Wrench className={`w-4 h-4 ${field.value ? 'text-orange-600' : 'text-zinc-400'}`} /> 
                    Ingreso a Taller (Externo)
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Activa esto si el equipo pertenece a un cliente.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          
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

            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <FormField control={form.control} name="sedeId" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-semibold text-zinc-900">Ubicación / Bodega *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-zinc-200 focus:ring-1 focus:ring-blue-500 shadow-sm">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sedes.map(sede => (
                        <SelectItem key={sede.id} value={sede.id.toString()}>{sede.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
         
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
                      {/* 🔥 Renderizado Agrupado */}
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
              )} />
            </div>

              {!isExterno ? (
              <FormField control={form.control} name="proveedorId" render={({ field }) => (
                <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold">Proveedor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl>
                    <SelectContent>{proveedores.map(prov => <SelectItem key={prov.id} value={prov.id.toString()}>{prov.nombre_empresa}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <div className="space-y-4 p-4 border border-orange-200 bg-orange-50/30 rounded-md">
                <FormField control={form.control} name="clienteId" render={({ field }) => (
                  <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Empresa Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-10 bg-white border-orange-200"><SelectValue placeholder="Seleccionar Dueño" /></SelectTrigger></FormControl>
                      <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre_comercial}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sucursalId" render={({ field }) => (
                  <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Sucursal / Origen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchCliente}>
                      <FormControl><SelectTrigger className="h-10 bg-white border-orange-200"><SelectValue placeholder="Sede del equipo" /></SelectTrigger></FormControl>
                      <SelectContent>{sucursalesFiltradas.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="tipoMantenimiento" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-amber-900">Tipo Trabajo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="bg-white h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Correctivo">Correctivo</SelectItem>
                          <SelectItem value="Preventivo">Preventivo</SelectItem>
                          <SelectItem value="Instalación">Instalación</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="prioridad" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-amber-900">Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="bg-white h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Baja">🟢 Baja</SelectItem>
                          <SelectItem value="Media">🟡 Media</SelectItem>
                          <SelectItem value="Alta">🟠 Alta</SelectItem>
                          <SelectItem value="Urgente">🔴 Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="notasIngreso" render={({ field }) => (
                  <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-orange-900">Estado al Recibir</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej. Pantalla rota, sin cargador..." className="bg-white border-orange-200 resize-none" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

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
                const isBlocked =  isExterno;
                return (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Stock Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className={`h-10 border-zinc-200 shadow-sm ${ isBlocked ? "bg-zinc-100 text-zinc-500 cursor-not-allowed focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`}
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        readOnly={isBlocked} // Bloqueamos el input si es unidad o externo
                        onChange={(e) => {
                          const valor = e.target.value;
                          
                          field.onChange(valor === '' ? 0 : Number(valor));
                        }}
                      />
                    </FormControl>
                    {esUnidad ? (
                      <FormDescription className="text-[10px] text-amber-600 font-medium leading-tight">
                        Bloqueado a 1 para equipos externos.
                      </FormDescription>
                    ) : (
                      <FormDescription className="text-xs text-zinc-500">{esUnidad ? "Se crearán etiquetas individuales." : "Cantidad total que ingresa."}</FormDescription>
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