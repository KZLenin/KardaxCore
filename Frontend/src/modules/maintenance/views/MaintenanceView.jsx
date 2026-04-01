import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wrench, AlertCircle } from "lucide-react";

import { maintenanceService } from '../services/maintenanceService';
import { inventoryService } from '../../inventory/services/inventoryService'; // Para traer los equipos al modal
import CreateTicketSheet from '../components/CreateTicketSheet';

const MaintenanceView = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [equipos, setEquipos] = useState([]); // Equipos operativos para el dropdown
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ordenesData, inventarioData] = await Promise.all([
        maintenanceService.getAll(),
        // Idealmente aquí le pasamos un filtro { estado_operativo: 'Operativo' } si tu backend lo soporta
        inventoryService.getAll() 
      ]);
      setOrdenes(ordenesData);
      setEquipos(inventarioData);
    } catch (error) {
      console.error("Error cargando vista de mantenimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getPrioridadBadge = (prioridad) => {
    switch (prioridad) {
      case 'Urgente': return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Urgente</Badge>;
      case 'Alta': return <Badge className="bg-orange-500 hover:bg-orange-600">Alta</Badge>;
      case 'Media': return <Badge className="bg-amber-500 hover:bg-amber-600">Media</Badge>;
      default: return <Badge className="bg-emerald-500 hover:bg-emerald-600">Baja</Badge>;
    }
  };

  const getEstadoBadge = (estado) => {
    if (estado === 'Pendiente') return <Badge variant="outline" className="text-zinc-500 border-zinc-300">Pendiente</Badge>;
    if (estado === 'En Revisión') return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">En Revisión</Badge>;
    if (estado === 'Finalizado') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Finalizado</Badge>;
    return <Badge variant="outline">{estado}</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER Y BOTÓN DE CREACIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600" /> Órdenes de Trabajo
          </h1>
          <p className="text-sm text-zinc-500">Gestiona las reparaciones y mantenimientos de los equipos.</p>
        </div>
        
        {/* AQUÍ INYECTAMOS TU COMPONENTE */}
        <CreateTicketSheet equipos={equipos} onCreated={cargarDatos} />
      </div>

      {/* TABLA DE TICKETS */}
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-amber-600" />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <AlertCircle className="h-12 w-12 mb-4 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-900">No hay tickets activos</p>
            <p className="text-sm">Crea una nueva orden de trabajo para empezar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead className="font-semibold text-zinc-900 w-[100px]">Fecha</TableHead>
                <TableHead className="font-semibold text-zinc-900">Equipo</TableHead>
                <TableHead className="font-semibold text-zinc-900">Motivo</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-center">Tipo</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-center">Prioridad</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenes.map((orden) => (
                <TableRow key={orden.id} className="hover:bg-zinc-50/50 cursor-pointer">
                  <TableCell className="text-sm text-zinc-600 font-medium">{orden.fecha}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-zinc-900">{orden.equipo_nombre}</p>
                    <p className="font-mono text-xs text-zinc-500">{orden.codigo_equipo}</p>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-sm text-zinc-600" title={orden.motivo}>
                    {orden.motivo}
                  </TableCell>
                  <TableCell className="text-center text-sm text-zinc-700">{orden.tipo}</TableCell>
                  <TableCell className="text-center">{getPrioridadBadge(orden.prioridad)}</TableCell>
                  <TableCell className="text-center">{getEstadoBadge(orden.estado)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default MaintenanceView;