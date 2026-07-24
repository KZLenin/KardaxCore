import React, { useState, useEffect } from 'react';
import { Loader2, FileSignature, Calendar, Building2, MapPin, Tag, CheckCircle, ShieldCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetHeader, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

import { quotesService } from '../services/quotesService';

const QuoteDetailsSheet = ({ cotizacionId, isOpen, setIsOpen, onAprobacionExitosa }) => {
  const { toast } = useToast();
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Array para guardar los IDs de los 'cotizaciones_detalle' que el cliente SI aceptó
  const [itemsAceptados, setItemsAceptados] = useState([]);

  useEffect(() => {
    if (cotizacionId && isOpen) {
      const cargarDetalles = async () => {
        setLoading(true);
        try {
          const data = await quotesService.obtenerDetalle(cotizacionId);
          setDetalle(data);
          
          // Si está pendiente, pre-seleccionamos todos por defecto para ahorrarle clicks al usuario
          if (data.estado === 'PENDIENTE' && data.cotizaciones_detalle) {
            setItemsAceptados(data.cotizaciones_detalle.map(item => item.id));
          } else {
            setItemsAceptados([]);
          }

        } catch (error) {
          console.error("Error cargando detalle de proforma:", error);
          toast({ title: "Error", description: "No se pudo cargar la información.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      cargarDetalles();
    } else {
      setDetalle(null);
      setItemsAceptados([]);
    }
  }, [cotizacionId, isOpen, toast]);

  // Manejador del checkbox individual
  const toggleItem = (detalleId) => {
    setItemsAceptados(prev => 
      prev.includes(detalleId) 
        ? prev.filter(id => id !== detalleId) // Lo quitamos
        : [...prev, detalleId] // Lo agregamos
    );
  };

  // 🚀 LA MAGIA: Enviar la aprobación al backend
  const handleAprobarVenta = async () => {
    if (itemsAceptados.length === 0) {
      return toast({ 
        title: "Atención", 
        description: "Debes seleccionar al menos un repuesto para generar la venta.", 
        variant: "destructive" 
      });
    }

    setIsSubmitting(true);
    try {
      const resultado = await quotesService.aprobarCotizacion(cotizacionId, itemsAceptados);
      
      toast({ 
        title: "¡Venta Generada!", 
        description: `Se ha creado la venta #${resultado.venta?.id?.split('-')[0] || 'Nueva'} exitosamente.` 
      });
      
      setIsOpen(false);
      if (onAprobacionExitosa) onAprobacionExitosa(); // Recarga la tabla del historial

    } catch (error) {
      console.error("Error al aprobar:", error);
      toast({ title: "Error al Procesar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculamos el total dinámico basado SOLO en lo que el usuario ha checkeado
  const calcularTotalDinamico = () => {
    if (!detalle?.cotizaciones_detalle) return 0;
    
    return detalle.cotizaciones_detalle
      .filter(item => itemsAceptados.includes(item.id))
      .reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0);
  };

  const esPendiente = detalle?.estado === 'PENDIENTE';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0">
        
        <SheetHeader className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm flex flex-row items-center justify-between">
          <div>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-600" /> Proforma 
              <span className="text-zinc-400 font-mono text-sm ml-2">#{cotizacionId?.split('-')[0]}</span>
            </SheetTitle>
            <SheetDescription>
              {detalle ? `Ref. Trilogo / PO: ${detalle.numero_orden_externa || 'S/N'}` : 'Cargando...'}
            </SheetDescription>
          </div>
          {detalle && (
            <Badge variant="outline" className={`
              ${detalle.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
              ${detalle.estado.includes('APROBADA') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
              ${detalle.estado === 'RECHAZADA' ? 'bg-red-100 text-red-700 border-red-200' : ''}
            `}>
              {detalle.estado}
            </Badge>
          )}
        </SheetHeader>

        {loading || !detalle ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Tarjeta de Info Comercial */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Building2 className="w-3 h-3"/> Cliente</span>
                <p className="font-medium text-zinc-900">{detalle.clientes_empresas?.nombre_comercial}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Tag className="w-3 h-3"/> RUC / ID</span>
                <p className="font-medium text-zinc-900">{detalle.clientes_empresas?.identificacion || 'N/A'}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha Emisión</span>
                <p className="font-medium text-zinc-900">{new Date(detalle.fecha_emision).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><MapPin className="w-3 h-3"/> Contacto</span>
                <p className="font-medium text-zinc-900">{detalle.clientes_empresas?.telefono || 'Sin registro'}</p>
              </div>
            </div>

            {/* Tabla de Repuestos */}
            <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    {esPendiente && <TableHead className="w-12 text-center">Sel.</TableHead>}
                    <TableHead className="font-bold text-zinc-900">Repuesto</TableHead>
                    <TableHead className="text-center font-bold text-zinc-900">Cant.</TableHead>
                    <TableHead className="text-right font-bold text-zinc-900">P. Unit</TableHead>
                    <TableHead className="text-right font-bold text-zinc-900">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalle.cotizaciones_detalle?.map((item) => (
                    <TableRow key={item.id} className={!esPendiente && item.estado_aprobacion === false ? 'opacity-40 bg-zinc-50' : ''}>
                      
                      {/* Mostrar Checkbox si está pendiente, o un iconito si ya se procesó */}
                      {esPendiente && (
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={itemsAceptados.includes(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!esPendiente && (
                            item.estado_aprobacion 
                              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                              : <span className="w-4 h-4 rounded-full border-2 border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400 font-bold">X</span>
                          )}
                          <div>
                            <p className="font-semibold text-zinc-900">{item.inventario?.nombre || 'Desconocido'}</p>
                            <p className="text-[11px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-1">
                              Cod: {item.inventario?.codigo_barras || 'S/N'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">{item.cantidad}</TableCell>
                      <TableCell className="text-right">${Number(item.precio_unitario).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.cantidad * item.precio_unitario).toFixed(2)}
                      </TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="bg-zinc-900 text-white p-4 flex justify-between items-center rounded-b-xl">
                <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">
                  {esPendiente ? 'Total Seleccionado' : 'Total Aprobado'}
                </span>
                <span className="text-2xl font-mono font-bold">
                  ${calcularTotalDinamico().toFixed(2)}
                </span>
              </div>
            </div>

            {detalle.notas_adicionales && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
                <strong>Notas: </strong> {detalle.notas_adicionales}
              </div>
            )}
          </div>
        )}

        {/* 🚀 BOTONERA DE ACCIÓN (Solo visible si está PENDIENTE) */}
        {detalle?.estado === 'PENDIENTE' && (
          <SheetFooter className="p-6 bg-white border-t border-zinc-200 sticky bottom-0">
            <div className="w-full flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={handleAprobarVenta}
                disabled={isSubmitting || itemsAceptados.length === 0}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 mr-2" /> Aprobar y Generar Venta</>
                )}
              </Button>
            </div>
          </SheetFooter>
        )}

      </SheetContent>
    </Sheet>
  );
};

export default QuoteDetailsSheet;