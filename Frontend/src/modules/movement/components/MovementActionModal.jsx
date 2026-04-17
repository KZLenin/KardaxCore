import React, { useState, useEffect } from 'react';
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Wrench, Check, Camera } from 'lucide-react'; // 🔥 Añadimos Camera
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { movementsService } from '../services/movementsService';

const MovementActionModal = ({ isOpen, onClose, tipoAccion, equipo, onSuccess }) => {
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [evidencia, setEvidencia] = useState(null); // 🔥 Nuevo estado para la foto
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setMotivo('');
      setEvidencia(null); // Limpiamos la foto al abrir
    }
  }, [isOpen]);

  if (!equipo) return null;

  const config = {
    INGRESO: { icono: ArrowDownToLine, color: 'text-emerald-600', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', titulo: 'Ingresar a Bodega', max: 9999 },
    BAJA: { icono: ArrowUpFromLine, color: 'text-rose-600', bg: 'bg-rose-600', hover: 'hover:bg-rose-700', titulo: 'Dar de Baja (Descarte)', max: equipo.stock },
    MANTENIMIENTO: { icono: Wrench, color: 'text-amber-500', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', titulo: 'Enviar a Taller', max: equipo.stock }
  }[tipoAccion] || config.INGRESO;

  const Icono = config.icono;

  // 🔥 Manejador para atrapar y validar la foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limite de 5MB
        toast.error("La foto debe pesar menos de 5MB");
        e.target.value = ''; 
        return;
      }
      setEvidencia(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cantidad > config.max && tipoAccion !== 'INGRESO') {
      return toast.error(`No puedes procesar más del stock actual (${equipo.stock})`);
    }

    // 🔥 Validación extra solo para BAJAS
    if (tipoAccion === 'BAJA' && !evidencia) {
      return toast.error("La fotografía de evidencia es obligatoria para dar de baja.");
    }

    setIsSubmitting(true);
    try {
      if (tipoAccion === 'BAJA') {
        // 🚀 Si es BAJA, usamos el método especial que armamos para FormData
        await movementsService.darDeBajaEquipo(
          equipo.id,
          { motivo: motivo.trim(), cantidadActual: Number(cantidad) },
          evidencia
        );
      } else {
        // 🚀 Si es normal, usamos el tuyo de siempre
        await movementsService.registrar({
          itemId: equipo.id,
          tipoMovimiento: tipoAccion,
          cantidad: Number(cantidad),
          motivo: motivo.trim(),
          destinoNombre: tipoAccion === 'MANTENIMIENTO' ? 'Taller Interno' : 'Bodega'
        });
      }
      
      toast.success(`${config.titulo} registrado con éxito`);
      onSuccess(); 
      onClose();
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${config.color}`}>
            <Icono className="w-6 h-6" /> {config.titulo}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Equipo: <strong className="text-zinc-900">{equipo.nombre}</strong> (Stock Físico: {equipo.stock})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="font-semibold text-zinc-900">Cantidad a procesar *</Label>
            <Input 
              type="number" min="1" max={config.max} 
              value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              className="text-lg font-mono w-1/2" required autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-zinc-900">Motivo / Detalles *</Label>
            <Textarea 
              placeholder="Ej. Devolución por garantía, equipo quemado, etc." 
              value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="resize-none focus:ring-blue-500 h-24" required
            />
          </div>

          {/* 🔥 SECCIÓN DE FOTO: Se inyecta aquí dinámicamente solo si es BAJA */}
          {tipoAccion === 'BAJA' && (
            <div className="bg-rose-50 border-2 border-dashed border-rose-200 rounded-lg p-4 text-center space-y-2">
              <Label className="font-semibold text-rose-700 uppercase block">Fotografía de Evidencia *</Label>
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-rose-400" />
                <Input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs file:bg-rose-100 file:text-rose-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:font-semibold hover:file:bg-rose-200"
                />
                {evidencia && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Foto lista: {evidencia.name}</p>}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" className={`${config.bg} ${config.hover} text-white shadow-md`} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : <><Check className="w-4 h-4 mr-2" /> Confirmar</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementActionModal;