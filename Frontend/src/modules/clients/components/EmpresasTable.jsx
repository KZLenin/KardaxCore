import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import { clientService } from '../services/clientService';
import CreateEmpresaSheet from './CreateEmpresaSheet';
import EditEmpresaSheet from './EditEmpresaSheet';

const EmpresasTable = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  const [empresaToEdit, setEmpresaToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const data = await clientService.obtenerEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const filtrados = empresas.filter(e => 
    e.nombre_comercial?.toLowerCase().includes(buscar.toLowerCase()) || 
    e.ruc?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por empresa o RUC..." 
            className="pl-9 bg-zinc-50 border-zinc-200" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        <CreateEmpresaSheet onCreated={fetchEmpresas} />
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" /> Cargando...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold text-zinc-900">Empresa Comercial</TableHead>
                <TableHead className="font-bold text-zinc-900">RUC</TableHead>
                <TableHead className="font-bold text-zinc-900">Razón Social</TableHead>
                <TableHead className="text-right font-bold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-zinc-500">No hay empresas registradas.</TableCell>
                </TableRow>
              ) : (
                filtrados.map((empresa) => (
                  <TableRow key={empresa.id} className="hover:bg-zinc-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-50 flex justify-center items-center border border-blue-100">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-zinc-900">{empresa.nombre_comercial}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-700">{empresa.ruc || '-'}</TableCell>
                    <TableCell className="text-sm text-zinc-600">{empresa.razon_social || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setEmpresaToEdit(empresa);
                          setIsEditOpen(true);
                        }}
                      >
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <EditEmpresaSheet 
        empresa={empresaToEdit}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onUpdated={fetchEmpresas}
      />
    </div>
  );
};

export default EmpresasTable;