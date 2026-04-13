import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { locationService } from '../services/locationService';
import CreateCountrySheet from './CreateCountrySheet';
import EditCountrySheet from './EditCountrySheet';

const PaisesTable = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [countryToEdit, setCountryToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchPaises = async () => {
    try {
      setLoading(true);
      const data = await locationService.getPaises();
      setCountries(data);
    } catch (error) {
      console.error("Error cargando países:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPaises(); }, []);

  const filtrados = countries.filter(p => 
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) || 
    p.prefijo.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar país o prefijo..." 
            className="pl-9" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        <CreateCountrySheet onCreated={fetchPaises} />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold">Nombre del País</TableHead>
                <TableHead className="font-bold">Prefijo</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-400" /> {p.nombre}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 uppercase">{p.prefijo}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => { setCountryToEdit(p); setIsEditOpen(true); }}
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

      <EditCountrySheet 
        country={countryToEdit} 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        onUpdated={fetchPaises} 
      />
    </div>
  );
};

export default PaisesTable;