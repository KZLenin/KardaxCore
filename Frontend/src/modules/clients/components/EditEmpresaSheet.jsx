import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, FileText, Check, Pencil, Unlock, X, Mail, Phone, MapPin, Briefcase, CreditCard, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { clientService } from '../services/clientService';
import { useToast } from "@/hooks/use-toast";

// 🔥 ZOD ALINEADO AL SRI
const formSchema = z.object({
  nombre_empresa: z.string().min(3, "Mínimo 3 letras"),
  tipo_identificacion: z.string().default("RUC"),
  identificacion: z.string().min(5, "Identificación requerida"), 
  razon_social: z.string().optional().nullable(),
  email_facturacion: z.string().email("Correo inválido").optional().or(z.literal('')).nullable(),
  telefono: z.string().optional().nullable(),
  direccion_principal: z.string().optional().nullable(),
  tipo_contribuyente: z.string().default("Régimen General"),
  categoria: z.string().default("Cliente Final"),
  nombre_contacto: z.string().optional().nullable(),
  limite_credito: z.coerce.number().min(0, "No puede ser negativo").default(0),
  dias_credito: z.coerce.number().min(0, "No puede ser negativo").default(0),
});

const EditEmpresaSheet = ({ empresa, isOpen, setIsOpen, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      nombre_empresa: "", tipo_identificacion: "RUC", identificacion: "", 
      razon_social: "", email_facturacion: "", telefono: "", direccion_principal: "",
      tipo_contribuyente: "Régimen General", categoria: "Cliente Final", 
      nombre_contacto: "", limite_credito: 0, dias_credito: 0 
    },
  });

  // 🔥 MAPEAMOS LOS DATOS DE LA BDD AL FORMULARIO
  useEffect(() => {
    if (empresa && isOpen) {
      form.setValue("nombre_empresa", empresa.nombre_comercial || "");
      form.setValue("tipo_identificacion", empresa.tipo_identificacion || "RUC");
      form.setValue("identificacion", empresa.identificacion || "");
      form.setValue("razon_social", empresa.razon_social || "");
      form.setValue("email_facturacion", empresa.email_facturacion || "");
      form.setValue("telefono", empresa.telefono || "");
      form.setValue("direccion_principal", empresa.direccion_principal || "");
      form.setValue("tipo_contribuyente", empresa.tipo_contribuyente || "Régimen General");
      form.setValue("categoria", empresa.categoria || "Cliente Final");
      form.setValue("nombre_contacto", empresa.nombre_contacto || "");
      form.setValue("limite_credito", empresa.limite_credito || 0);
      form.setValue("dias_credito", empresa.dias_credito || 0);
    } else if (!isOpen) {
      form.reset();
      setIsEditing(false);
    }
  }, [empresa, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await clientService.actualizarEmpresa(empresa.id, values);
      toast({ title: "¡Actualizado!", description: "Ficha de cliente modificada correctamente." });
      setIsEditing(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clase dinámica para bloquear visualmente los inputs
  const inputClass = `h-10 border-zinc-200 shadow-sm ${!isEditing ? "bg-zinc-100/50 text-zinc-700 cursor-default focus-visible:ring-0" : "focus:ring-1 focus:ring-blue-500 bg-white"}`;
  const inputClassWithIcon = `pl-9 ${inputClass}`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-zinc-200 flex justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-zinc-700" />}
              {isEditing ? "Editar Cliente" : "Ficha de Cliente"}
            </SheetTitle>
            <SheetDescription>Datos oficiales para ventas y SRI.</SheetDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 border border-blue-200" size="sm">
              <Unlock className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 flex-1 flex flex-col">
            
            <div className="space-y-8 flex-1">
              
              {/* === BLOQUE 1: DATOS OFICIALES SRI === */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Datos de Facturación
                </h3>

                <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Nombre Comercial *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input className={inputClassWithIcon} {...field} readOnly={!isEditing} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="tipo_identificacion" render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel className="text-sm font-semibold">Tipo Doc.</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="RUC">RUC</SelectItem>
                          <SelectItem value="CEDULA">Cédula</SelectItem>
                          <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="identificacion" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm font-semibold">Identificación *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input className={`${inputClassWithIcon} font-mono`} {...field} readOnly={!isEditing} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="razon_social" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Razón Social Oficial</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} value={field.value || ''} readOnly={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="tipo_contribuyente" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Tipo de Contribuyente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                      <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Régimen General">Régimen General</SelectItem>
                        <SelectItem value="RIMPE Emprendedor">RIMPE Emprendedor</SelectItem>
                        <SelectItem value="RIMPE Negocio Popular">RIMPE Negocio Popular</SelectItem>
                        <SelectItem value="Agente de Retención">Agente de Retención / Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              {/* === BLOQUE 2: CONTACTO Y LOGÍSTICA === */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Contacto y Matriz
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email_facturacion" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email Facturación</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input className={inputClassWithIcon} {...field} value={field.value || ''} readOnly={!isEditing} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="telefono" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Teléfono Matriz</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input className={inputClassWithIcon} {...field} value={field.value || ''} readOnly={!isEditing} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="direccion_principal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Dirección Matriz</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} value={field.value || ''} readOnly={!isEditing} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              {/* === BLOQUE 3: PERFIL COMERCIAL === */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Perfil Comercial
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-3 h-4 w-4 text-zinc-400 z-10" />
                            <SelectTrigger className={`pl-9 ${inputClass}`}><SelectValue /></SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cliente Final">Cliente Final</SelectItem>
                          <SelectItem value="Mayorista">Mayorista / Distribuidor</SelectItem>
                          <SelectItem value="Cliente Corporativo">Cliente Corporativo (VIP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="nombre_contacto" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Contacto Comercial</FormLabel>
                      <FormControl>
                        <Input className={inputClass} {...field} value={field.value || ''} readOnly={!isEditing} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-100/50 border border-zinc-200 rounded-lg">
                  <FormField control={form.control} name="dias_credito" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Días de Crédito</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className={inputClass} {...field} readOnly={!isEditing} />
                      </FormControl>
                      {isEditing && <FormDescription className="text-xs">0 si es de contado.</FormDescription>}
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="limite_credito" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Límite Aprobado ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input type="number" step="0.01" min="0" className={`${inputClassWithIcon} font-mono`} {...field} readOnly={!isEditing} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* === FOOTER ACCIONES === */}
            {isEditing && (
              <div className="border-t border-zinc-200 pt-6 mt-auto flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                  Guardar Cambios
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