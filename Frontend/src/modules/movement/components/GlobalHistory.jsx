import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { movementsService } from '../services/movementsService';

const GlobalHistory = () => {
  const [historialGlobal, setHistorialGlobal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await movementsService.getAll();
        setHistorialGlobal(data);
      } catch (err) {
        toast.error("Error al cargar auditoría global");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Card className="shadow-md border-zinc-200 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="flex flex-row items-center justify-between bg-zinc-50 border-b border-zinc-200">
        <CardTitle className="text-lg font-bold text-zinc-900">Registro General de Movimientos</CardTitle>
        <Badge variant="outline" className="bg-white">{historialGlobal.length} registros</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                <TableRow>
                  <TableHead className="font-semibold text-zinc-900">Fecha</TableHead>
                  <TableHead className="font-semibold text-zinc-900">Acción</TableHead>
                  <TableHead className="font-semibold text-zinc-900">Artículo</TableHead>
                  <TableHead className="font-semibold text-zinc-900">Detalle Operativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialGlobal.map((h) => (
                  <TableRow key={h.id} className="hover:bg-zinc-50">
                    <TableCell className="text-zinc-500 whitespace-nowrap text-xs">
                      {new Date(h.fecha_registro).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${h.tipo_accion.includes('INGRESO') ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                        {h.tipo_accion}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-900 text-sm">{h.inventario?.nombre || 'Desconocido'}</TableCell>
                    <TableCell className="text-zinc-600 text-sm max-w-md">{h.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalHistory;