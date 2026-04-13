import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Globe, Check, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { locationService } from '../services/locationService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 letras"),
  prefijo: z.string().min(2, "Mínimo 2 letras"),
});

const CreateCountrySheet = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", prefijo: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await locationService.registrarPais(values);
      toast({ title: "¡País Registrado!", description: "Se ha añadido a la base global." });
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
        <Plus className="w-4 h-4 mr-2" /> Nuevo País
      </Button>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200">
          <SheetTitle className="text-2xl font-bold">Registrar País</SheetTitle>
          <SheetDescription>Agrega una nueva región operativa para SOI Soluciones.</SheetDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Nombre del País *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Ej. Ecuador, Colombia..." className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="prefijo" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Prefijo / Código *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Ej. EC, +593..." className="pl-9 uppercase" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="pt-6 border-t mt-auto">
              <Button type="submit" className="w-full h-11 bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Guardar País"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCountrySheet;