import React, { useState, useEffect } from 'react';
import { Search, Loader2, ReceiptText, Printer, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { salesService } from '../services/salesService';

const SalesHistoryTable = () => {
  const { toast } = useToast();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await salesService.getHistorialVentas({ buscar: busqueda });
      setVentas(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo cargar el historial.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Efecto con un pequeño delay para buscar mientras escribes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarHistorial();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  const handleImprimir = (ventaId) => {
    toast({ title: "Generando PDF...", description: "Esta función la conectaremos pronto. 🚀" });
    // Aquí irá la lógica para abrir el PDF en una nueva pestaña
  };

  return (
    <div className="space-y-4">
      {/* BARRA DE BÚSQUEDA */}
      <div className="flex bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente, factura o PO..." 
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
            <p>Cargando transacciones...</p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <ReceiptText className="h-12 w-12 mb-4 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-900">No hay ventas registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-semibold text-zinc-900 w-32">Fecha</TableHead>
                <TableHead className="font-semibold text-zinc-900">Cliente</TableHead>
                <TableHead className="font-semibold text-zinc-900">Comprobante</TableHead>
                <TableHead className="text-center font-semibold text-zinc-900">Cant. Equipos</TableHead>
                <TableHead className="text-right font-semibold text-zinc-900">Total</TableHead>
                <TableHead className="text-center font-semibold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {ventas.map((venta) => (
                    <TableRow key={venta.id} className="hover:bg-zinc-50/50">
                    
                    {/* 1. LA FECHA CORRECTA */}
                    <TableCell className="text-zinc-600 text-sm">
                        {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : 'S/F'}
                    </TableCell>
                    
                    {/* EL CLIENTE */}
                    <TableCell className="font-medium text-zinc-900">
                        {venta.cliente_nombre}
                    </TableCell>
                    
                    {/* EL COMPROBANTE */}
                    <TableCell>
                        <Badge variant="outline" className="font-mono bg-zinc-50 text-zinc-600">
                        {venta.numero_comprobante || 'S/N'}
                        </Badge>
                    </TableCell>
                    
                    {/* 2. LA CANTIDAD DE EQUIPOS (Calculada por el Backend) */}
                    <TableCell className="text-center font-mono text-zinc-600">
                        {venta.total_items || 0}
                    </TableCell>
                    
                    {/* 3. EL TOTAL (Tu columna real) */}
                    <TableCell className="text-right font-mono font-bold text-zinc-900">
                        ${Number(venta.total_venta || 0).toFixed(2)}
                    </TableCell>
                    
                    {/* BOTONES */}
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Ver Detalles">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:bg-zinc-100" onClick={() => handleImprimir(venta.id)} title="Imprimir Recibo">
                            <Printer className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    
                    </TableRow>
                ))}
                </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default SalesHistoryTable;