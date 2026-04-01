import React, { useState, useEffect } from 'react';
import CreateProviderSheet from './CreateProviderSheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Building2 } from "lucide-react";
import { inventoryService } from '../services/inventoryService';

const ProvidersTable = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Sacamos la función afuera y le ponemos el nombre correcto
  const fetchProviders = async () => {
    try {
      setLoading(true); // Opcional: vuelve a mostrar el spinner al recargar
      const data = await inventoryService.getProveedores();
      setProviders(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);  
    }
  };

  // 2. El useEffect ahora solo llama a nuestra función cuando el componente carga
  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-zinc-900">Directorio de Proveedores</h3>
        </div>
        <CreateProviderSheet onCreated={fetchProviders} />
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Empresa</TableHead>
              <TableHead className="font-semibold">Contacto</TableHead>
              <TableHead className="font-semibold">Teléfono</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((prov) => (
              <TableRow key={prov.id}>
                <TableCell className="font-bold text-zinc-900">{prov.nombre_empresa}</TableCell>
                <TableCell className="text-zinc-600">{prov.contacto_nombre || 'Sin contacto'}</TableCell>
                <TableCell className="text-zinc-500">{prov.telefono || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">Ver Ficha</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ProvidersTable;