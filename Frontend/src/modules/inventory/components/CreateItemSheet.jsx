import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Box, ScanText, User, Hash, Check, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; 
import { Textarea } from "@/components/ui/textarea"; 

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast"; //



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
      notasIngreso: ""
    },
  });

  const watchUnidad = form.watch("unidadMedida");
  const isExterno = form.watch("es_externo");
  const watchCliente = form.watch("clienteId");

  useEffect(() => {
  if (watchUnidad === 'Unidad' || watchUnidad === 'UNIDAD' || isExterno) {
    form.setValue("cantidadStock", 1); // Forzamos el valor en el formulario
  } 
  if (isExterno) {
      form.setValue("proveedorId", ""); // Limpia proveedor por si acaso
    } else {
      form.setValue("clienteId", "");
      form.setValue("sucursalId", "");
    }
  }, [watchUnidad, isExterno, form]);

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
                const isBlocked = watchUnidad === 'UNIDAD' || isExterno;
                return (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-zinc-900">Stock Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className={`h-10 border-zinc-200 shadow-sm ${esUnidad || isBlocked ? "bg-zinc-100 text-zinc-500 cursor-not-allowed focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`}
                        {...field}
                        readOnly={esUnidad || isBlocked} // Bloqueamos el input si es unidad o externo
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