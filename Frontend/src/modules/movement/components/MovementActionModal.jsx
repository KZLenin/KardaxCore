import React, { useState, useEffect } from 'react';
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Wrench, Check } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setMotivo('');
    }
  }, [isOpen]);

  if (!equipo) return null;

  const config = {
    INGRESO: { icono: ArrowDownToLine, color: 'text-emerald-600', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', titulo: 'Ingresar a Bodega', max: 9999 },
    BAJA: { icono: ArrowUpFromLine, color: 'text-rose-600', bg: 'bg-rose-600', hover: 'hover:bg-rose-700', titulo: 'Dar de Baja (Descarte)', max: equipo.stock },
    MANTENIMIENTO: { icono: Wrench, color: 'text-amber-500', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', titulo: 'Enviar a Taller', max: equipo.stock }
  }[tipoAccion] || config.INGRESO;

  const Icono = config.icono;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cantidad > config.max && tipoAccion !== 'INGRESO') {
      return toast.error(`No puedes procesar más del stock actual (${equipo.stock})`);
    }

    setIsSubmitting(true);
    try {
      await movementsService.registrar({
        itemId: equipo.id,
        tipoMovimiento: tipoAccion,
        cantidad: Number(cantidad),
        motivo: motivo.trim(),
        destinoNombre: tipoAccion === 'MANTENIMIENTO' ? 'Taller Interno' : (tipoAccion === 'BAJA' ? 'Descarte' : 'Bodega')
      });
      
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