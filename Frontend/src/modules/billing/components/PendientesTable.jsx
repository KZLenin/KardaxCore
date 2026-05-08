import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, FileText, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { billingService } from '../services/billingService';

const PendientesTable = () => {
  const { toast } = useToast();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Array con los IDs de las ventas seleccionadas
  const [seleccionadas, setSeleccionadas] = useState([]);

  const cargarPendientes = async () => {
    try {
      setLoading(true);
      const data = await billingService.getPendientes();
      setOrdenes(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar las órdenes pendientes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  // --- LÓGICA DE SELECCIÓN INTELIGENTE ---
  const handleSelect = (ordenId, checked) => {
    if (checked) {
      setSeleccionadas([...seleccionadas, ordenId]);
    } else {
      setSeleccionadas(seleccionadas.filter(id => id !== ordenId));
    }
  };

  // Saber a qué empresa pertenecen las órdenes actualmente seleccionadas
  const empresaSeleccionadaId = seleccionadas.length > 0 
    ? ordenes.find(o => o.id === seleccionadas[0])?.empresa_id 
    : null;

  // Filtrado de búsqueda
  const filtrados = ordenes.filter(o => 
    o.empresa?.nombre_comercial?.toLowerCase().includes(buscar.toLowerCase()) || 
    o.numero_comprobante?.toLowerCase().includes(buscar.toLowerCase())
  );

  // Cálculos de la Factura a Generar
  const totalAgrupado = ordenes
    .filter(o => seleccionadas.includes(o.id))
    .reduce((sum, o) => sum + Number(o.total_venta), 0);

  // --- ACCIÓN: FACTURAR ---
  const handleGenerarFactura = async () => {
    if (seleccionadas.length === 0 || !empresaSeleccionadaId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        empresaId: empresaSeleccionadaId,
        ventasIds: seleccionadas,
        notas: "Factura generada por agrupación de despachos."
      };

      await billingService.generarFactura(payload);
      toast({ title: "¡Éxito!", description: "Factura generada correctamente." });
      
      setSeleccionadas([]); // Limpiar selección
      cargarPendientes(); // Recargar tabla
      
    } catch (error) {
      toast({ title: "Error", description: error.message || error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente o guía..." 
            className="pl-9 bg-zinc-50 border-zinc-200" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>

        {/* Panel Resumen de Selección */}
        {seleccionadas.length > 0 && (
          <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 w-full sm:w-auto">
            <div className="text-sm">
              <span className="text-emerald-700 font-semibold">{seleccionadas.length} órdenes</span>
              <span className="text-zinc-500 mx-2">|</span>
              <span className="font-mono font-bold text-emerald-900">${totalAgrupado.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleGenerarFactura} 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Generar Factura
            </Button>
          </div>
        )}
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-emerald-600" /> Buscando órdenes pendientes...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead className="font-bold text-zinc-900">Fecha Despacho</TableHead>
                <TableHead className="font-bold text-zinc-900">Cliente (Empresa)</TableHead>
                <TableHead className="font-bold text-zinc-900">Nro. Guía / Ref</TableHead>
                <TableHead className="text-right font-bold text-zinc-900">Total Orden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500">No hay órdenes pendientes de facturar.</TableCell>
                </TableRow>
              ) : (
                filtrados.map((orden) => {
                  const isSelected = seleccionadas.includes(orden.id);
                  // Solo se puede seleccionar si no hay nada seleccionado, O si es del mismo cliente que la primera seleccionada
                  const isDisabled = empresaSeleccionadaId && empresaSeleccionadaId !== orden.empresa_id;

                  return (
                    <TableRow 
                      key={orden.id} 
                      className={`transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-zinc-50/50'} ${isDisabled ? 'opacity-50 grayscale' : ''}`}
                    >
                      <TableCell className="text-center align-middle">
                        <Checkbox 
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) => handleSelect(orden.id, checked)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="text-sm text-zinc-600">
                        {new Date(orden.fecha_venta).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900">{orden.empresa?.nombre_comercial}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">RUC: {orden.empresa?.identificacion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-zinc-600 bg-white">
                          <FileText className="w-3 h-3 mr-1" /> {orden.numero_comprobante || 'S/N'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-zinc-900">
                        ${Number(orden.total_venta).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PendientesTable;