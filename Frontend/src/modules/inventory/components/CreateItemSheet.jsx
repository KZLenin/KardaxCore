import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Box, ScanText, Check, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

import { inventoryService } from '../services/inventoryService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3),
  sedeId: z.string().min(1),
  categoriaId: z.string().min(1),
  proveedorId: z.string().optional(),
  serieFabricante: z.string().optional(),
  codigoBarras: z.string().optional(),
  cantidadStock: z.coerce.number().min(1),
  unidadMedida: z.string().min(1),
  es_externo: z.boolean().default(false),
  clienteId: z.string().optional(),
  sucursalId: z.string().optional(),
  notasIngreso: z.string().optional()
});

const CreateItemSheet = ({ sedes = [], categorias = [], proveedores = [], clientes = [], sucursales = [], onCreated }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    if (watchUnidad === 'UNIDAD' || isExterno) {
      form.setValue("cantidadStock", 1);
    }

    if (isExterno) {
      form.setValue("proveedorId", "");
    } else {
      form.setValue("clienteId", "");
      form.setValue("sucursalId", "");
    }
  }, [watchUnidad, isExterno]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await inventoryService.registrarEntrada(values);
      toast({ title: "¡Éxito!", description: "Artículo registrado." });
      form.reset();
      setIsOpen(false);
      onCreated && onCreated();
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriasPrincipales = categorias.filter(c => !c.categoria_padre_id);
  const getSubcategorias = (id) => categorias.filter(c => c.categoria_padre_id === id);
  const sucursalesFiltradas = sucursales.filter(s => s.empresa_id === watchCliente);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>

      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Registrar Entrada
      </Button>

      <SheetContent className="sm:max-w-md overflow-y-auto">

        <div className="p-6 border-b">
          <SheetTitle>Nuevo Artículo</SheetTitle>
          <SheetDescription>Registrar en inventario</SheetDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">

            {/* SWITCH */}
            <FormField
              control={form.control}
              name="es_externo"
              render={({ field }) => (
                <FormItem className="flex justify-between p-4 border rounded">
                  <FormLabel className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Ingreso externo
                  </FormLabel>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormItem>
              )}
            />

            {/* NOMBRE */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name="sedeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sede</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sedes.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriasPrincipales.map(p => (
                          <SelectGroup key={p.id}>
                            <SelectLabel>{p.nombre}</SelectLabel>
                            <SelectItem value={p.id.toString()}>{p.nombre}</SelectItem>
                            {getSubcategorias(p.id).map(h => (
                              <SelectItem key={h.id} value={h.id.toString()}>
                                ↳ {h.nombre}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

            </div>

            {/* PROVEEDOR / CLIENTE */}
            {!isExterno ? (
              <FormField
                control={form.control}
                name="proveedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proveedores.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.nombre_empresa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nombre_comercial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sucursalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sucursal</FormLabel>
                      <Select onValueChange={field.onChange} disabled={!watchCliente}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sucursalesFiltradas.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.nombre_sucursal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notasIngreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <Textarea {...field} />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* SERIE */}
            <FormField
              control={form.control}
              name="serieFabricante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serie</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />

            {/* STOCK */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cantidadStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <Input type="number" {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                        <SelectItem value="CAJA">CAJA</SelectItem>
                        <SelectItem value="METRO">METRO</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />}
                Guardar
              </Button>
            </SheetFooter>

          </form>
        </Form>

      </SheetContent>
    </Sheet>
  );
};

export default CreateItemSheet;