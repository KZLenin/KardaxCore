import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wrench, AlertCircle, Search } from "lucide-react"; // 🔥 Añadimos el icono de Search
import { Input } from "@/components/ui/input"; // 🔥 Importamos el Input

import { maintenanceService } from '../services/maintenanceService';
import { inventoryService } from '../../inventory/services/inventoryService'; 
import CreateTicketSheet from '../components/CreateTicketSheet';
import ProcessTicketSheet from '../components/ProcessTicketSheet';

const MaintenanceView = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [equipos, setEquipos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // 🔥 NUEVO ESTADO: Lo que el usuario escribe en el buscador
  const [searchTerm, setSearchTerm] = useState("");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ordenesData, inventarioData] = await Promise.all([
        maintenanceService.getAll(),
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

  // 🔥 EL FILTRO MÁGICO: Filtramos el array base buscando coincidencias
  const ordenesFiltradas = ordenes.filter((orden) => {
    const termino = searchTerm.toLowerCase();
    return (
      orden.equipo_nombre.toLowerCase().includes(termino) ||
      orden.codigo_equipo.toLowerCase().includes(termino) ||
      (orden.motivo && orden.motivo.toLowerCase().includes(termino))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER Y ACCIONES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600" /> Órdenes de Trabajo
          </h1>
          <p className="text-sm text-zinc-500">Gestiona las reparaciones y mantenimientos de los equipos.</p>
        </div>
        
        {/* 🔥 BARRA DE BÚSQUEDA + BOTÓN */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar equipo, código o motivo..."
              className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-amber-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateTicketSheet equipos={equipos} onCreated={cargarDatos} />
        </div>
      </div>

      {/* TABLA DE TICKETS */}
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-amber-600" />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? ( // 🔥 Usamos el array filtrado
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <AlertCircle className="h-12 w-12 mb-4 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-900">
              {searchTerm ? "No se encontraron coincidencias" : "No hay tickets activos"}
            </p>
            <p className="text-sm">
              {searchTerm ? "Prueba buscando con otro término." : "Crea una nueva orden de trabajo para empezar."}
            </p>
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
              {ordenesFiltradas.map((orden) => {
                // 🔥 Evaluamos si la orden ya está "muerta" operativamente
                const isFinalizado = ['Finalizado', 'Reparado', 'Listo para Entrega'].includes(orden.estado);

                return (
                  <TableRow 
                    key={orden.id} 
                    // 🔥 Aquí está la magia UI: Si está finalizado, lo volvemos "fantasma"
                    className={`cursor-pointer transition-all duration-200 ${
                      isFinalizado 
                        ? 'opacity-50 bg-zinc-50/80 hover:opacity-80 hover:bg-zinc-100 grayscale-[0.5]' 
                        : 'hover:bg-zinc-50/50'
                    }`} 
                    onClick={() => setSelectedTicket(orden)}
                  >
                    <TableCell className="text-sm font-medium text-zinc-500">{orden.fecha}</TableCell>
                    <TableCell>
                      {/* Bajamos un poco el contraste del texto si está finalizado */}
                      <p className={`font-semibold ${isFinalizado ? 'text-zinc-600' : 'text-zinc-900'}`}>
                        {orden.equipo_nombre}
                      </p>
                      <p className="font-mono text-xs text-zinc-400">{orden.codigo_equipo}</p>
                    </TableCell>
                    <TableCell className={`max-w-[250px] truncate text-sm ${isFinalizado ? 'text-zinc-400' : 'text-zinc-600'}`} title={orden.motivo}>
                      {orden.motivo}
                    </TableCell>
                    <TableCell className={`text-center text-sm ${isFinalizado ? 'text-zinc-400' : 'text-zinc-700'}`}>
                      {orden.tipo}
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Si está finalizado, mostramos un badge gris sutil en lugar del de colores fuertes */}
                      {isFinalizado ? (
                        <Badge variant="outline" className="text-zinc-400 border-zinc-200 bg-zinc-50/50 font-normal">
                          Completado
                        </Badge>
                      ) : (
                        getPrioridadBadge(orden.prioridad)
                      )}
                    </TableCell>
                    <TableCell className="text-center">{getEstadoBadge(orden.estado)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      
      <ProcessTicketSheet 
        ticket={selectedTicket} 
        isOpen={!!selectedTicket} 
        setIsOpen={() => setSelectedTicket(null)} 
        onUpdated={cargarDatos} 
      />
    </div>
  );
};

export default MaintenanceView;