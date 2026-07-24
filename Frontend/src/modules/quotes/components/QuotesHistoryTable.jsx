import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Printer, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { quotesService } from '../services/quotesService';
import QuoteDetailsSheet from './QuoteDetailsSheet'; 

const QuotesHistoryTable = () => {
  const { toast } = useToast();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [imprimiendoId, setImprimiendoId] = useState(null);

  // Estados para el Modal de Detalles/Aprobación
  const [cotizacionSeleccionadaId, setCotizacionSeleccionadaId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await quotesService.listarCotizaciones();
      setCotizaciones(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo cargar el historial de proformas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Función para renderizar el estado con colores bonitos
  const renderBadgeEstado = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
      case 'APROBADA_TOTAL':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Aprob. Total</Badge>;
      case 'APROBADA_PARCIAL':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Aprob. Parcial</Badge>;
      case 'RECHAZADA':
      case 'VENCIDA':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none"><AlertCircle className="w-3 h-3 mr-1"/> {estado}</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const handleVerDetalles = (id) => {
    setCotizacionSeleccionadaId(id);
    setIsDetailsOpen(true);
  };

  const handleImprimir = async (id) => {
    setImprimiendoId(id);
    toast({ title: "Generando Proforma...", description: "Abriendo PDF en nueva pestaña..." });
    
    try {
      const pdfBlob = await quotesService.descargarPDF(id);
      const fileURL = URL.createObjectURL(pdfBlob);
      window.open(fileURL, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);

    } catch (error) {
      toast({ title: "Error", description: "Hubo un problema al generar la proforma.", variant: "destructive" });
    } finally {
      setImprimiendoId(null);
    }
  };

  // Filtrado local básico para el frontend
  const filtradas = cotizaciones.filter(cot => 
    cot.clientes_empresas?.nombre_comercial?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cot.numero_orden_externa?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* BARRA DE BÚSQUEDA */}
      <div className="flex bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente u orden..." 
            className="pl-9 bg-zinc-50 border-transparent focus:bg-white transition-colors"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div className="border border-zinc-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p>Cargando proformas...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <FileText className="h-12 w-12 mb-4 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-900">No hay proformas registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-semibold text-zinc-900 w-32">Fecha</TableHead>
                <TableHead className="font-semibold text-zinc-900">Cliente</TableHead>
                <TableHead className="font-semibold text-zinc-900">Ref. Externa (PO)</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-center">Estado</TableHead>
                <TableHead className="text-center font-semibold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filtradas.map((cot) => (
                    <TableRow key={cot.id} className="hover:bg-zinc-50/50">
                    
                    <TableCell className="text-zinc-600 text-sm">
                        {new Date(cot.fecha_emision).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell className="font-medium text-zinc-900">
                        {cot.clientes_empresas?.nombre_comercial || 'Desconocido'}
                    </TableCell>
                    
                    <TableCell>
                        <span className="font-mono text-zinc-600">
                        {cot.numero_orden_externa || 'S/N'}
                        </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                        {renderBadgeEstado(cot.estado)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50" 
                          title="Gestionar / Ver Detalles"
                          onClick={() => handleVerDetalles(cot.id)} 
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-600 hover:bg-zinc-100" 
                          onClick={() => handleImprimir(cot.id)} 
                          title="Descargar Proforma"
                          disabled={imprimiendoId === cot.id}
                        >
                            {imprimiendoId === cot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        </Button>
                        </div>
                    </TableCell>
                    
                    </TableRow>
                ))}
                </TableBody>
          </Table>
        )}
      </div>
      
      
      <QuoteDetailsSheet 
        cotizacionId={cotizacionSeleccionadaId} 
        isOpen={isDetailsOpen} 
        setIsOpen={setIsDetailsOpen}
        onAprobacionExitosa={cargarHistorial} // Pasamos la función para que recargue la tabla al crear la venta
      /> 
    </div>
  );
};

export default QuotesHistoryTable;