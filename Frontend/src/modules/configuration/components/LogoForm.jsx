import React, { useState, useRef } from 'react';
import { Loader2, ImageIcon, UploadCloud, Check, X, Unlock, Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { configurationService } from '../services/configurationService';

export const LogoForm = ({ configInicial, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(configInicial?.logo_url || null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Mostramos la previsualización local antes de subir a Supabase
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setArchivoSeleccionado(file);
  };

  const handleSave = async () => {
    if (!archivoSeleccionado) {
      toast({ title: "Aviso", description: "No has seleccionado ninguna imagen nueva." });
      setIsEditing(false);
      return;
    }

    setIsUploading(true);
    try {
      await configurationService.actualizarLogo(archivoSeleccionado);
      toast({ title: "¡Branding Actualizado!", description: "El logo se guardó correctamente." });
      setIsEditing(false);
      setArchivoSeleccionado(null);
      if (onUpdated) onUpdated();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Error al subir logo", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(configInicial?.logo_url || null);
    setArchivoSeleccionado(null);
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      
      <div className="bg-zinc-50/80 p-5 border-b border-zinc-200 flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-zinc-700" />}
            {isEditing ? "Actualizar Logo" : "Logo de la Empresa"}
          </h3>
          <p className="text-sm text-zinc-500">Este logo aparecerá en las facturas, PDFs y etiquetas.</p>
        </div>
        
        {!isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" size="sm">
            <Unlock className="w-4 h-4 mr-2" /> Cambiar Logo
          </Button>
        )}
      </div>

      <div className="p-6">
        <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${isEditing ? 'border-blue-300 bg-blue-50/30' : 'border-zinc-200 bg-zinc-50/50'}`}>
          
          {previewUrl ? (
            <div className="relative group">
              <img src={previewUrl} alt="Logo Empresa" className="w-48 h-48 object-contain rounded-md bg-white border border-zinc-200 shadow-sm p-2" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Elegir otra
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">Sin logo configurado</p>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
                  <UploadCloud className="w-4 h-4 mr-2" /> Seleccionar Imagen
                </Button>
              )}
            </div>
          )}
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileSelect} disabled={!isEditing} />
        </div>

        {/* FOOTER DE ACCIONES */}
        {isEditing && (
          <div className="border-t border-zinc-200 pt-6 mt-6 flex gap-3 justify-end">
            <Button type="button" variant="outline" className="h-10" onClick={handleCancel} disabled={isUploading}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="button" onClick={handleSave} className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled={isUploading || !archivoSeleccionado}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : <><Check className="mr-2 h-5 w-5" /> Guardar Logo</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};