import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Building2 } from "lucide-react";
import { inventoryService } from '../services/inventoryService';

const ProvidersTable = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await inventoryService.listarProveedores();
        setProviders(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-zinc-900">Directorio de Proveedores</h3>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Razón Social / Empresa</TableHead>
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