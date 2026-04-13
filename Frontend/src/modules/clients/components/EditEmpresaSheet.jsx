import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, FileText, Check, Pencil, Unlock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { clientService } from '../services/clientService';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre_empresa: z.string().min(3, "Mínimo 3 letras"),
  ruc: z.string().optional().nullable(),
  ruc_razon_social: z.string().optional().nullable(),
});

const EditEmpresaSheet = ({ empresa, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_empresa: "", ruc: "", ruc_razon_social: "" },
  });

  useEffect(() => {
    if (empresa && isOpen) {
      form.setValue("nombre_empresa", empresa.nombre_comercial || "");
      form.setValue("ruc", empresa.ruc || "");
      form.setValue("ruc_razon_social", empresa.razon_social || "");
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [empresa, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await clientService.actualizarEmpresa(empresa.id, values);
      toast({ title: "¡Actualizado!", description: "Empresa modificada correctamente." });
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `pl-9 h-10 border-zinc-200 shadow-sm ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Empresa" : "Ficha de Empresa"}
            </SheetTitle>
            <SheetDescription>Datos financieros.</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 border border-blue-200" size="sm">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Nombre Comercial *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
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
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
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
                      <Input className={inputClass} {...field} readOnly={!isEditing} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {isEditing && (
              <div className="border-t border-zinc-200 pt-6 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                  Guardar
                </Button>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditEmpresaSheet;