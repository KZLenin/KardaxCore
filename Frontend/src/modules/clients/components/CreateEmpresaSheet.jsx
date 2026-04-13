import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Building2, FileText, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { clientService } from '../services/clientService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_empresa: z.string().min(3, "Mínimo 3 letras"),
  ruc: z.string().min(10, "RUC inválido").optional().or(z.literal('')),
  ruc_razon_social: z.string().optional(),
});

const CreateEmpresaSheet = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_empresa: "", ruc: "", ruc_razon_social: "" },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await clientService.crearEmpresa(values);
      toast({ title: "¡Empresa Registrada!", description: "Ahora puedes añadirle sucursales." });
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
      <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md">
        <Plus className="w-4 h-4 mr-2" /> Nueva Empresa
      </Button>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0">
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Nueva Empresa
          </SheetTitle>
          <SheetDescription>Registra el ente financiero (RUC).</SheetDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Nombre Comercial *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Ej. SmartFit" className="pl-9 h-10 bg-white" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="ruc" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">RUC</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="1790000000001" className="pl-9 h-10 bg-white" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="ruc_razon_social" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Razón Social</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Gimnasios Inteligentes S.A." className="pl-9 h-10 bg-white" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <SheetFooter className="mt-8 pt-6 border-t border-zinc-200">
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                Guardar Empresa
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateEmpresaSheet;