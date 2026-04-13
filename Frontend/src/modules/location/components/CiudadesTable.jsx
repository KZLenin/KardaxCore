import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { locationService } from '../services/locationService';
import CreateCitySheet from './CreateCitySheet';
import EditCitySheet from './EditCitySheet';

const CiudadesTable = () => {
  const [ciudades, setCiudades] = useState([]);
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  // Estados de edición
  const [cityToEdit, setCityToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      // Descargamos ambas cosas en paralelo para más velocidad
      const [dataCiudades, dataPaises] = await Promise.all([
        locationService.getCiudades(),
        locationService.getPaises()
      ]);
      setCiudades(dataCiudades);
      setPaises(dataPaises);
    } catch (error) {
      console.error("Error cargando datos de ubicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  // Buscador: Busca por nombre de ciudad o por nombre del país asociado
  const filtrados = ciudades.filter(c => {
    const termino = buscar.toLowerCase();
    const nombreCiudad = c.nombre?.toLowerCase() || '';
    const nombrePais = c.paises?.nombre?.toLowerCase() || '';
    return nombreCiudad.includes(termino) || nombrePais.includes(termino);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar ciudad o país..." 
            className="pl-9 bg-zinc-50 focus:bg-white" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        
        {/* Le pasamos los países al modal de creación */}
        <CreateCitySheet onCreated={fetchDatos} paises={paises} />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold">Nombre de la Ciudad</TableHead>
                <TableHead className="font-bold">País</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium flex items-center gap-2 text-zinc-900">
                    <MapPin className="w-4 h-4 text-zinc-400" /> {c.nombre}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {/* El backend nos devuelve el nombre del país en el objeto 'paises' */}
                    {c.paises?.nombre || 'Desconocido'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => { setCityToEdit(c); setIsEditOpen(true); }}
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

      {/* Le pasamos la ciudad seleccionada y la lista de países al modal de edición */}
      <EditCitySheet 
        city={cityToEdit} 
        paises={paises}
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        onUpdated={fetchDatos} 
      />
    </div>
  );
};

export default CiudadesTable;