import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Building, MapPin, Check, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService } from '../services/locationService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  ciudad_id: z.string().min(1, "Debes seleccionar una ciudad"),
  direccion: z.string().optional(),
});

const CreateSedeSheet = ({ onCreated, ciudades = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", ciudad_id: "", direccion: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await locationService.registrarSede(values);
      toast({ title: "¡Sede Creada!", description: "La sucursal ya está lista para operar." });
      form.reset();
      setIsOpen(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" /> Nueva Sede
      </Button>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200">
          <SheetTitle className="text-2xl font-bold">Registrar Sede</SheetTitle>
          <SheetDescription>Configura una nueva sucursal física para la logística.</SheetDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              <FormField control={form.control} name="ciudad_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">Ciudad de Ubicación *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-zinc-200">
                        <div className="flex items-center gap-2 text-zinc-600">
                          <MapPin className="w-4 h-4" />
                          <SelectValue placeholder="Seleccionar ciudad..." />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ciudades.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} ({c.paises?.nombre})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">Nombre de la Sede *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Bodega Norte, Oficina Central..." className="pl-9 h-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="direccion" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-zinc-900">Dirección Física</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input placeholder="Ej. Calle Av. Amazonas N32..." className="pl-9 h-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="pt-6 border-t mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Guardar Sede</>}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSedeSheet;