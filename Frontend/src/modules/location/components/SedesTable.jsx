import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Building, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { locationService } from '../services/locationService';
import CreateSedeSheet from './CreateSedeSheet';
import EditSedeSheet from './EditSedeSheet';

const SedesTable = () => {
  const [sedes, setSedes] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  const [sedeToEdit, setSedeToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const [dataSedes, dataCiudades] = await Promise.all([
        locationService.getSedes(),
        locationService.getCiudades()
      ]);
      setSedes(dataSedes);
      setCiudades(dataCiudades);
    } catch (error) {
      console.error("Error cargando sedes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const filtrados = sedes.filter(s => {
    const t = buscar.toLowerCase();
    return s.nombre?.toLowerCase().includes(t) || 
           s.ciudades?.nombre?.toLowerCase().includes(t) ||
           s.direccion?.toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por sede o ciudad..." 
            className="pl-9 bg-zinc-50" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        <CreateSedeSheet onCreated={fetchDatos} ciudades={ciudades} />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold">Nombre de la Sede</TableHead>
                <TableHead className="font-bold">Ubicación Geográfica</TableHead>
                <TableHead className="font-bold">Dirección</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((s) => (
                <TableRow key={s.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium text-zinc-950 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" /> {s.nombre}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" /> 
                      {s.ciudades?.nombre}, {s.ciudades?.paises?.nombre}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 italic text-sm truncate max-w-[200px]">
                    {s.direccion || 'Sin dirección registrada'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => { setSedeToEdit(s); setIsEditOpen(true); }}
                    >
                      Ver Ficha
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EditSedeSheet 
        sede={sedeToEdit} 
        ciudades={ciudades}
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        onUpdated={fetchDatos} 
      />
    </div>
  );
};

export default SedesTable;